namespace Platform.Core.Entities;

public class Project : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public required string Name { get; set; }
    public string? Description { get; set; }
    public Guid CreatedByUserId { get; set; }

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
    public ICollection<Board> Boards { get; set; } = new List<Board>();
}
