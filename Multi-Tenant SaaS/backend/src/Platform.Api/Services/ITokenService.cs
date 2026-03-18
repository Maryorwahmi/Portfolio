using Platform.Infrastructure.Identity;

namespace Platform.Api.Services;

public interface ITokenService
{
    Task<string> CreateTokenAsync(ApplicationUser user);
}
