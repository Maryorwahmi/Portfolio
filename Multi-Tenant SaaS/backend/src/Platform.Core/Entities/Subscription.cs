using Platform.Core.Enums;

namespace Platform.Core.Entities;

public class Subscription : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid PlanId { get; set; }
    public SubscriptionStatus Status { get; set; } = SubscriptionStatus.Trialing;
    public DateTime StartDateUtc { get; set; } = DateTime.UtcNow;
    public DateTime CurrentPeriodEndUtc { get; set; } = DateTime.UtcNow.AddDays(14);
    public bool CancelAtPeriodEnd { get; set; }

    public SubscriptionPlan? Plan { get; set; }
    public Tenant? Tenant { get; set; }
}
