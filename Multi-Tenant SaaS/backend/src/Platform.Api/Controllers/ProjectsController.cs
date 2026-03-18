using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Core.Abstractions;
using Platform.Core.Entities;
using Platform.Core.Enums;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/projects")]
public class ProjectsController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUser _currentUser;

    public ProjectsController(ApplicationDbContext db, ICurrentUser currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyCollection<ProjectSummary>>> GetAll(CancellationToken cancellationToken)
    {
        var projects = await _db.Projects
            .Include(p => p.Boards)
            .OrderByDescending(p => p.CreatedAtUtc)
            .Select(p => new ProjectSummary(p.Id, p.Name, p.Description, p.Boards.Count))
            .ToListAsync(cancellationToken);

        return Ok(projects);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectSummary>> Create(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
        {
            return Unauthorized();
        }

        var project = new Project
        {
            Name = request.Name.Trim(),
            Description = request.Description,
            CreatedByUserId = userId.Value
        };

        _db.Projects.Add(project);
        _db.ProjectMembers.Add(new ProjectMember
        {
            Project = project,
            UserId = userId.Value,
            Role = ProjectRole.Admin
        });

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new ProjectSummary(project.Id, project.Name, project.Description, 0));
    }

    [HttpGet("{projectId:guid}")]
    public async Task<ActionResult<ProjectDetail>> Get(Guid projectId, CancellationToken cancellationToken)
    {
        var project = await _db.Projects
            .Include(p => p.Boards)
            .ThenInclude(b => b.Lists)
            .ThenInclude(l => l.Cards)
            .FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);

        if (project == null)
        {
            return NotFound();
        }

        var boards = project.Boards
            .OrderBy(b => b.Position)
            .Select(b => new BoardSnapshot(
                b.Id,
                b.Name,
                b.Lists.OrderBy(l => l.Position)
                    .Select(l => new BoardListSnapshot(
                        l.Id,
                        l.Name,
                        l.Position,
                        l.Cards.OrderBy(c => c.Position)
                            .Select(c => new CardSnapshot(c.Id, c.Title, c.Description, c.Status))
                            .ToList()))
                    .ToList()))
            .ToList();

        return Ok(new ProjectDetail(project.Id, project.Name, project.Description, boards));
    }

    [HttpPost("{projectId:guid}/members")]
    public async Task<ActionResult> AddMember(Guid projectId, AddMemberRequest request, CancellationToken cancellationToken)
    {
        var project = await _db.Projects.FirstOrDefaultAsync(p => p.Id == projectId, cancellationToken);
        if (project == null)
        {
            return NotFound();
        }

        var exists = await _db.ProjectMembers.AnyAsync(
            m => m.ProjectId == projectId && m.UserId == request.UserId,
            cancellationToken);

        if (exists)
        {
            return Conflict(new { message = "Member already exists." });
        }

        _db.ProjectMembers.Add(new ProjectMember
        {
            ProjectId = projectId,
            UserId = request.UserId,
            Role = request.Role
        });

        await _db.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    [HttpPost("{projectId:guid}/boards")]
    public async Task<ActionResult<BoardSummary>> CreateBoard(Guid projectId, CreateBoardRequest request, CancellationToken cancellationToken)
    {
        var board = new Board
        {
            ProjectId = projectId,
            Name = request.Name.Trim(),
            Position = request.Position
        };

        _db.Boards.Add(board);
        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new BoardSummary(board.Id, board.Name, board.Position));
    }
}

public record CreateProjectRequest(string Name, string? Description);
public record ProjectSummary(Guid Id, string Name, string? Description, int BoardCount);
public record ProjectDetail(Guid Id, string Name, string? Description, IReadOnlyCollection<BoardSnapshot> Boards);
public record BoardSnapshot(Guid Id, string Name, IReadOnlyCollection<BoardListSnapshot> Lists);
public record BoardListSnapshot(Guid Id, string Name, int Position, IReadOnlyCollection<CardSnapshot> Cards);
public record CardSnapshot(Guid Id, string Title, string? Description, CardStatus Status);
public record AddMemberRequest(Guid UserId, ProjectRole Role);
public record CreateBoardRequest(string Name, int Position);
public record BoardSummary(Guid Id, string Name, int Position);
