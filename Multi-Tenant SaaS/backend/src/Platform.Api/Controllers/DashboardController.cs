using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public DashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> Get(CancellationToken cancellationToken)
    {
        var projects = await _db.Projects.CountAsync(cancellationToken);
        var boards = await _db.Boards.CountAsync(cancellationToken);
        var cards = await _db.Cards.CountAsync(cancellationToken);
        var eventsIngested = await _db.AnalyticsEvents.CountAsync(cancellationToken);

        return Ok(new DashboardResponse(projects, boards, cards, eventsIngested));
    }
}

public record DashboardResponse(int Projects, int Boards, int Cards, int EventsIngested);
