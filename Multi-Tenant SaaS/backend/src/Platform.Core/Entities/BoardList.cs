namespace Platform.Core.Entities;

public class BoardList : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid BoardId { get; set; }
    public required string Name { get; set; }
    public int Position { get; set; }

    public Board? Board { get; set; }
    public ICollection<Card> Cards { get; set; } = new List<Card>();
}
