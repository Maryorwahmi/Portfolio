namespace Platform.Core.Entities;

public class Tenant : BaseEntity
{
    public required string Name { get; set; }
    public required string Slug { get; set; }
    public string? Industry { get; set; }
    public ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
}
