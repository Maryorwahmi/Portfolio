namespace Platform.Core.Entities;

public class Board : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid ProjectId { get; set; }
    public required string Name { get; set; }
    public int Position { get; set; }

    public Project? Project { get; set; }
    public ICollection<BoardList> Lists { get; set; } = new List<BoardList>();
}
