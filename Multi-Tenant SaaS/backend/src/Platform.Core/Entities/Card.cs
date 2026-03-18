using Platform.Core.Enums;

namespace Platform.Core.Entities;

public class Card : BaseEntity, ITenantScoped
{
    public Guid TenantId { get; set; }
    public Guid BoardListId { get; set; }
    public required string Title { get; set; }
    public string? Description { get; set; }
    public int Position { get; set; }
    public CardStatus Status { get; set; } = CardStatus.Todo;
    public Guid? AssigneeUserId { get; set; }
    public DateTime? DueDateUtc { get; set; }

    public BoardList? BoardList { get; set; }
}
