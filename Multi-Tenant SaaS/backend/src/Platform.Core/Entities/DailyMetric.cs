namespace Platform.Core.Entities;

public class DailyMetric : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public required string MetricKey { get; set; }
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}
