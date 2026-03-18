namespace Platform.Core.Entities;

public interface ITenantScoped
{
    Guid TenantId { get; set; }
}
