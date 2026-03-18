using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Platform.Api.Hubs;
using Platform.Core.Entities;
using Platform.Core.Enums;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api")]
public class BoardsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly IHubContext<BoardHub> _hub;

    public BoardsController(ApplicationDbContext db, IHubContext<BoardHub> hub)
    {
        _db = db;
        _hub = hub;
    }

    [HttpGet("boards/{boardId:guid}")]
    public async Task<ActionResult<BoardDetail>> GetBoard(Guid boardId, CancellationToken cancellationToken)
    {
        var board = await _db.Boards
            .Include(b => b.Lists)
            .ThenInclude(l => l.Cards)
            .FirstOrDefaultAsync(b => b.Id == boardId, cancellationToken);

        if (board == null)
        {
            return NotFound();
        }

        var lists = board.Lists
            .OrderBy(l => l.Position)
            .Select(l => new BoardListDetail(
                l.Id,
                l.Name,
                l.Position,
                l.Cards.OrderBy(c => c.Position)
                    .Select(c => new CardDetail(c.Id, c.Title, c.Description, c.Status, c.AssigneeUserId))
                    .ToList()))
            .ToList();

        return Ok(new BoardDetail(board.Id, board.Name, lists));
    }

    [HttpPost("boards/{boardId:guid}/lists")]
    public async Task<ActionResult<BoardListDetail>> CreateList(Guid boardId, CreateListRequest request, CancellationToken cancellationToken)
    {
        var list = new BoardList
        {
            BoardId = boardId,
            Name = request.Name.Trim(),
            Position = request.Position
        };

        _db.BoardLists.Add(list);
        await _db.SaveChangesAsync(cancellationToken);

        await _hub.Clients.Group($"board:{boardId}")
            .SendAsync("BoardUpdated", new { type = "list_created", listId = list.Id }, cancellationToken);

        return Ok(new BoardListDetail(list.Id, list.Name, list.Position, Array.Empty<CardDetail>()));
    }

    [HttpPost("lists/{listId:guid}/cards")]
    public async Task<ActionResult<CardDetail>> CreateCard(Guid listId, CreateCardRequest request, CancellationToken cancellationToken)
    {
        var list = await _db.BoardLists.FirstOrDefaultAsync(l => l.Id == listId, cancellationToken);
        if (list == null)
        {
            return NotFound();
        }

        var card = new Card
        {
            BoardListId = listId,
            Title = request.Title.Trim(),
            Description = request.Description,
            Position = request.Position,
            Status = CardStatus.Todo
        };

        _db.Cards.Add(card);
        await _db.SaveChangesAsync(cancellationToken);

        await _hub.Clients.Group($"board:{list.BoardId}")
            .SendAsync("BoardUpdated", new { type = "card_created", cardId = card.Id }, cancellationToken);

        return Ok(new CardDetail(card.Id, card.Title, card.Description, card.Status, card.AssigneeUserId));
    }

    [HttpPatch("cards/{cardId:guid}")]
    public async Task<ActionResult<CardDetail>> UpdateCard(Guid cardId, UpdateCardRequest request, CancellationToken cancellationToken)
    {
        var card = await _db.Cards
            .Include(c => c.BoardList)
            .FirstOrDefaultAsync(c => c.Id == cardId, cancellationToken);

        if (card == null)
        {
            return NotFound();
        }

        if (!string.IsNullOrWhiteSpace(request.Title))
        {
            card.Title = request.Title.Trim();
        }

        if (request.Description != null)
        {
            card.Description = request.Description;
        }

        if (request.Status.HasValue)
        {
            card.Status = request.Status.Value;
        }

        if (request.Position.HasValue)
        {
            card.Position = request.Position.Value;
        }

        if (request.AssigneeUserId.HasValue)
        {
            card.AssigneeUserId = request.AssigneeUserId.Value;
        }

        if (request.BoardListId.HasValue && request.BoardListId.Value != card.BoardListId)
        {
            card.BoardListId = request.BoardListId.Value;
        }

        await _db.SaveChangesAsync(cancellationToken);

        var boardId = card.BoardList?.BoardId;
        if (boardId != null)
        {
            await _hub.Clients.Group($"board:{boardId}")
                .SendAsync("BoardUpdated", new { type = "card_updated", cardId = card.Id }, cancellationToken);
        }

        return Ok(new CardDetail(card.Id, card.Title, card.Description, card.Status, card.AssigneeUserId));
    }
}

public record BoardDetail(Guid Id, string Name, IReadOnlyCollection<BoardListDetail> Lists);
public record BoardListDetail(Guid Id, string Name, int Position, IReadOnlyCollection<CardDetail> Cards);
public record CardDetail(Guid Id, string Title, string? Description, CardStatus Status, Guid? AssigneeUserId);
public record CreateListRequest(string Name, int Position);
public record CreateCardRequest(string Title, string? Description, int Position);
public record UpdateCardRequest(string? Title, string? Description, CardStatus? Status, int? Position, Guid? AssigneeUserId, Guid? BoardListId);
