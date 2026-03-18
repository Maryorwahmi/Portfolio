using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Platform.Core.Abstractions;

namespace Platform.Infrastructure.MultiTenancy;

public class TenantProvider : ITenantProvider
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantProvider(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? TenantId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return null;
            }

            var claim = httpContext.User.FindFirst("tenant_id")?.Value;
            if (Guid.TryParse(claim, out var tenantId))
            {
                return tenantId;
            }

            var header = httpContext.Request.Headers["X-Tenant-Id"].ToString();
            if (Guid.TryParse(header, out tenantId))
            {
                return tenantId;
            }

            return null;
        }
    }

    public string? TenantSlug
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext == null)
            {
                return null;
            }

            var claim = httpContext.User.FindFirst("tenant_slug")?.Value;
            if (!string.IsNullOrWhiteSpace(claim))
            {
                return claim;
            }

            var header = httpContext.Request.Headers["X-Tenant-Slug"].ToString();
            return string.IsNullOrWhiteSpace(header) ? null : header;
        }
    }
}
