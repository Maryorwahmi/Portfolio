using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Core.Abstractions;
using Platform.Core.Entities;
using Platform.Core.Enums;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Route("api/billing")]
public class BillingController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ITenantProvider _tenantProvider;

    public BillingController(ApplicationDbContext db, ITenantProvider tenantProvider)
    {
        _db = db;
        _tenantProvider = tenantProvider;
    }

    [HttpGet("plans")]
    public async Task<ActionResult<IReadOnlyCollection<BillingPlanResponse>>> Plans(CancellationToken cancellationToken)
    {
        var plans = await _db.SubscriptionPlans
            .Where(p => p.IsActive)
            .OrderBy(p => p.PriceMonthlyCents)
            .Select(p => new BillingPlanResponse(
                p.Id,
                p.Name,
                p.Description,
                p.PriceMonthlyCents,
                p.MaxUsers,
                p.MaxProjects))
            .ToListAsync(cancellationToken);

        return Ok(plans);
    }

    [Authorize]
    [HttpPost("subscribe")]
    public async Task<ActionResult<BillingCheckoutResponse>> Subscribe(SubscribeRequest request, CancellationToken cancellationToken)
    {
        var tenantId = _tenantProvider.TenantId;
        if (tenantId == null)
        {
            return Unauthorized();
        }

        var plan = await _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == request.PlanId, cancellationToken);
        if (plan == null)
        {
            return NotFound(new { message = "Plan not found." });
        }

        var subscription = await _db.Subscriptions.FirstOrDefaultAsync(cancellationToken);
        if (subscription == null)
        {
            subscription = new Subscription
            {
                PlanId = plan.Id,
                Status = SubscriptionStatus.Active,
                StartDateUtc = DateTime.UtcNow,
                CurrentPeriodEndUtc = DateTime.UtcNow.AddMonths(1)
            };
            _db.Subscriptions.Add(subscription);
        }
        else
        {
            subscription.PlanId = plan.Id;
            subscription.Status = SubscriptionStatus.Active;
            subscription.CurrentPeriodEndUtc = DateTime.UtcNow.AddMonths(1);
        }

        await _db.SaveChangesAsync(cancellationToken);

        var mockUrl = $"https://billing.local/checkout/{subscription.Id}";
        return Ok(new BillingCheckoutResponse(mockUrl, "Mock checkout ready"));
    }

    [Authorize]
    [HttpGet("portal")]
    public ActionResult<BillingPortalResponse> Portal()
    {
        return Ok(new BillingPortalResponse("https://billing.local/portal", "Mock billing portal"));
    }
}

public record BillingPlanResponse(Guid Id, string Name, string? Description, int PriceMonthlyCents, int MaxUsers, int MaxProjects);
public record SubscribeRequest(Guid PlanId);
public record BillingCheckoutResponse(string CheckoutUrl, string Message);
public record BillingPortalResponse(string PortalUrl, string Message);
