using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Platform.Api.Hubs;

[Authorize]
public class BoardHub : Hub
{
    public Task JoinBoard(string boardId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, $"board:{boardId}");

    public Task LeaveBoard(string boardId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, $"board:{boardId}");
}
