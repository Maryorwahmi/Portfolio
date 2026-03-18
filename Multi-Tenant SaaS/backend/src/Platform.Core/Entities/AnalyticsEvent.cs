namespace Platform.Core.Entities;

public class AnalyticsEvent : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public required string Name { get; set; }
    public double Value { get; set; }
    public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
    public string? Source { get; set; }
}
