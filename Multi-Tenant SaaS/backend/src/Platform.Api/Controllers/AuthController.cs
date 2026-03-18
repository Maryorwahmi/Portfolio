using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Platform.Api.Services;
using Platform.Core.Abstractions;
using Platform.Infrastructure.Data;
using Platform.Infrastructure.Identity;

namespace Platform.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ITokenService _tokenService;
    private readonly ICurrentUser _currentUser;

    public AuthController(
        ApplicationDbContext db,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ITokenService tokenService,
        ICurrentUser currentUser)
    {
        _db = db;
        _userManager = userManager;
        _roleManager = roleManager;
        _tokenService = tokenService;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == request.TenantSlug, cancellationToken);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        await EnsureRolesAsync(cancellationToken);

        var existingCount = await _db.Users.CountAsync(u => u.TenantId == tenant.Id, cancellationToken);
        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            DisplayName = request.DisplayName,
            TenantId = tenant.Id
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = "Registration failed.", errors = result.Errors.Select(e => e.Description) });
        }

        var role = existingCount == 0 ? "Admin" : "User";
        await _userManager.AddToRoleAsync(user, role);

        var token = await _tokenService.CreateTokenAsync(user);
        return Ok(new AuthResponse(token, user.Email ?? string.Empty, new[] { role }, tenant.Id));
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var tenant = await _db.Tenants.FirstOrDefaultAsync(t => t.Slug == request.TenantSlug, cancellationToken);
        if (tenant == null)
        {
            return NotFound(new { message = "Tenant not found." });
        }

        var user = await _userManager.Users.FirstOrDefaultAsync(
            u => u.Email == request.Email && u.TenantId == tenant.Id,
            cancellationToken);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var valid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!valid)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var roles = await _userManager.GetRolesAsync(user);
        var token = await _tokenService.CreateTokenAsync(user);
        return Ok(new AuthResponse(token, user.Email ?? string.Empty, roles.ToArray(), tenant.Id));
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<MeResponse> Me()
    {
        return Ok(new MeResponse(_currentUser.UserId, _currentUser.Email, _currentUser.Roles));
    }

    private async Task EnsureRolesAsync(CancellationToken cancellationToken)
    {
        if (!await _roleManager.RoleExistsAsync("Admin"))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
        }

        if (!await _roleManager.RoleExistsAsync("User"))
        {
            await _roleManager.CreateAsync(new IdentityRole<Guid>("User"));
        }
    }
}

public record RegisterRequest(string TenantSlug, string Email, string Password, string? DisplayName);
public record LoginRequest(string TenantSlug, string Email, string Password);
public record AuthResponse(string Token, string Email, IReadOnlyCollection<string> Roles, Guid TenantId);
public record MeResponse(Guid? UserId, string? Email, IReadOnlyCollection<string> Roles);
