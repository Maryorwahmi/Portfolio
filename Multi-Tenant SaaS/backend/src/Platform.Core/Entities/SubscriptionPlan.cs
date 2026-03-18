namespace Platform.Core.Entities;

public class SubscriptionPlan : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public int PriceMonthlyCents { get; set; }
    public int MaxUsers { get; set; }
    public int MaxProjects { get; set; }
    public bool IsActive { get; set; } = true;
}
