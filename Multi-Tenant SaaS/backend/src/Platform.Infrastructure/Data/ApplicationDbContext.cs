using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Platform.Core.Abstractions;
using Platform.Core.Entities;
using Platform.Infrastructure.Identity;

namespace Platform.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    private readonly Guid? _tenantId;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options, ITenantProvider tenantProvider)
        : base(options)
    {
        _tenantId = tenantProvider.TenantId;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<ProjectMember> ProjectMembers => Set<ProjectMember>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<BoardList> BoardLists => Set<BoardList>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<AnalyticsEvent> AnalyticsEvents => Set<AnalyticsEvent>();
    public DbSet<DailyMetric> DailyMetrics => Set<DailyMetric>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Tenant>(entity =>
        {
            entity.HasIndex(t => t.Slug).IsUnique();
            entity.Property(t => t.Name).HasMaxLength(200);
            entity.Property(t => t.Slug).HasMaxLength(80);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasIndex(p => new { p.TenantId, p.Name });
            entity.Property(p => p.Name).HasMaxLength(200);
            entity.HasQueryFilter(p => _tenantId != null && p.TenantId == _tenantId);
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasIndex(pm => new { pm.TenantId, pm.ProjectId, pm.UserId }).IsUnique();
            entity.HasQueryFilter(pm => _tenantId != null && pm.TenantId == _tenantId);
        });

        modelBuilder.Entity<Board>(entity =>
        {
            entity.HasIndex(b => new { b.TenantId, b.ProjectId });
            entity.Property(b => b.Name).HasMaxLength(200);
            entity.HasQueryFilter(b => _tenantId != null && b.TenantId == _tenantId);
        });

        modelBuilder.Entity<BoardList>(entity =>
        {
            entity.HasIndex(bl => new { bl.TenantId, bl.BoardId });
            entity.Property(bl => bl.Name).HasMaxLength(200);
            entity.HasQueryFilter(bl => _tenantId != null && bl.TenantId == _tenantId);
        });

        modelBuilder.Entity<Card>(entity =>
        {
            entity.HasIndex(c => new { c.TenantId, c.BoardListId });
            entity.Property(c => c.Title).HasMaxLength(200);
            entity.HasQueryFilter(c => _tenantId != null && c.TenantId == _tenantId);
        });

        modelBuilder.Entity<Subscription>(entity =>
        {
            entity.HasIndex(s => new { s.TenantId, s.PlanId });
            entity.HasQueryFilter(s => _tenantId != null && s.TenantId == _tenantId);
        });

        modelBuilder.Entity<AnalyticsEvent>(entity =>
        {
            entity.HasIndex(a => new { a.TenantId, a.Name, a.OccurredAtUtc });
            entity.HasQueryFilter(a => _tenantId != null && a.TenantId == _tenantId);
        });

        modelBuilder.Entity<DailyMetric>(entity =>
        {
            entity.HasIndex(d => new { d.TenantId, d.MetricKey, d.Date }).IsUnique();
            entity.HasQueryFilter(d => _tenantId != null && d.TenantId == _tenantId);
        });

        modelBuilder.Entity<Project>()
            .HasMany(p => p.Boards)
            .WithOne(b => b.Project)
            .HasForeignKey(b => b.ProjectId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Board>()
            .HasMany(b => b.Lists)
            .WithOne(l => l.Board)
            .HasForeignKey(l => l.BoardId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<BoardList>()
            .HasMany(l => l.Cards)
            .WithOne(c => c.BoardList)
            .HasForeignKey(c => c.BoardListId)
            .OnDelete(DeleteBehavior.Cascade);
    }

    public override int SaveChanges()
    {
        ApplyTenantAndAudit();
        return base.SaveChanges();
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        ApplyTenantAndAudit();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void ApplyTenantAndAudit()
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAtUtc = now;
                entry.Entity.UpdatedAtUtc = now;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAtUtc = now;
            }
        }

        foreach (var entry in ChangeTracker.Entries<ITenantScoped>())
        {
            if (entry.State == EntityState.Added && entry.Entity.TenantId == Guid.Empty)
            {
                if (_tenantId == null)
                {
                    throw new InvalidOperationException("Tenant scope is required for this operation.");
                }

                entry.Entity.TenantId = _tenantId.Value;
            }
        }
    }
}
