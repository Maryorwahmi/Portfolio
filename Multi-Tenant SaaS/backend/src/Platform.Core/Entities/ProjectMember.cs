using Platform.Core.Enums;

namespace Platform.Core.Entities;

public class ProjectMember : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid UserId { get; set; }
    public ProjectRole Role { get; set; } = ProjectRole.Member;
    public DateTime JoinedAtUtc { get; set; } = DateTime.UtcNow;

    public Project? Project { get; set; }
}
