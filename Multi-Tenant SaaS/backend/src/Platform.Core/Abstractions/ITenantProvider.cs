namespace Platform.Core.Abstractions;

public interface ITenantProvider
{
    Guid? TenantId { get; }
    string? TenantSlug { get; }
}
