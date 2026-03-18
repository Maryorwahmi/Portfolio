using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Core.Entities;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/analytics")]
public class AnalyticsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AnalyticsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost("events")]
    public async Task<ActionResult> Ingest(AnalyticsEventRequest request, CancellationToken cancellationToken)
    {
        var occurredAt = request.OccurredAtUtc ?? DateTime.UtcNow;
        var eventEntity = new AnalyticsEvent
        {
            Name = request.Name.Trim(),
            Value = request.Value,
            OccurredAtUtc = occurredAt,
            Source = request.Source
        };

        _db.AnalyticsEvents.Add(eventEntity);

        var date = DateOnly.FromDateTime(occurredAt);
        var metric = await _db.DailyMetrics.FirstOrDefaultAsync(
            d => d.MetricKey == eventEntity.Name && d.Date == date,
            cancellationToken);

        if (metric == null)
        {
            _db.DailyMetrics.Add(new DailyMetric
            {
                MetricKey = eventEntity.Name,
                Date = date,
                Count = 1
            });
        }
        else
        {
            metric.Count += 1;
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Accepted();
    }

    [HttpGet("summary")]
    public async Task<ActionResult<AnalyticsSummaryResponse>> Summary([FromQuery] int days = 7, CancellationToken cancellationToken = default)
    {
        if (days <= 0)
        {
            days = 7;
        }

        var sinceDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-days + 1));
        var metrics = await _db.DailyMetrics
            .Where(m => m.Date >= sinceDate)
            .OrderBy(m => m.Date)
            .ToListAsync(cancellationToken);

        var series = metrics
            .GroupBy(m => m.MetricKey)
            .Select(group => new AnalyticsSeries(
                group.Key,
                group.Select(m => new AnalyticsPoint(m.Date, m.Count)).ToList()))
            .ToList();

        return Ok(new AnalyticsSummaryResponse(series));
    }
}

public record AnalyticsEventRequest(string Name, double Value, DateTime? OccurredAtUtc, string? Source);
public record AnalyticsPoint(DateOnly Date, int Count);
public record AnalyticsSeries(string MetricKey, IReadOnlyCollection<AnalyticsPoint> Points);
public record AnalyticsSummaryResponse(IReadOnlyCollection<AnalyticsSeries> Series);
