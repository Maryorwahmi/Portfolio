using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Core.Entities;
using Platform.Infrastructure.Data;

namespace Platform.Api.Controllers;

[ApiController]
[Route("api/tenants")]
public class TenantsController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public TenantsController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult<TenantResponse>> Create(CreateTenantRequest request, CancellationToken cancellationToken)
    {
        var slug = request.Slug.Trim().ToLowerInvariant();
        var exists = await _db.Tenants.AnyAsync(t => t.Slug == slug, cancellationToken);
        if (exists)
        {
            return Conflict(new { message = "Tenant slug already exists." });
        }

        var tenant = new Tenant
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Industry = request.Industry
        };

        _db.Tenants.Add(tenant);

        var plan = await _db.SubscriptionPlans.FirstOrDefaultAsync(p => p.IsActive, cancellationToken);
        if (plan != null)
        {
            _db.Subscriptions.Add(new Subscription
            {
                TenantId = tenant.Id,
                PlanId = plan.Id,
                Status = Platform.Core.Enums.SubscriptionStatus.Trialing,
                StartDateUtc = DateTime.UtcNow,
                CurrentPeriodEndUtc = DateTime.UtcNow.AddDays(14)
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
        return Ok(new TenantResponse(tenant.Id, tenant.Name, tenant.Slug));
    }

    [HttpGet("resolve")]
    public async Task<ActionResult<TenantResponse>> Resolve([FromQuery] string slug, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == slug, cancellationToken);
        if (tenant == null)
        {
            return NotFound();
        }

        return Ok(new TenantResponse(tenant.Id, tenant.Name, tenant.Slug));
    }
}

public record CreateTenantRequest(string Name, string Slug, string? Industry);
public record TenantResponse(Guid Id, string Name, string Slug);
