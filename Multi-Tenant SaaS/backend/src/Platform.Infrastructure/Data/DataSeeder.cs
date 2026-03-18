using Microsoft.EntityFrameworkCore;
using Platform.Core.Entities;

namespace Platform.Infrastructure.Data;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext db, CancellationToken cancellationToken = default)
    {
        if (!await db.SubscriptionPlans.AnyAsync(cancellationToken))
        {
            db.SubscriptionPlans.AddRange(
                new SubscriptionPlan
                {
                    Name = "Starter",
                    Description = "For small teams proving product fit.",
                    PriceMonthlyCents = 1900,
                    MaxUsers = 5,
                    MaxProjects = 5,
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    Name = "Growth",
                    Description = "Scaling product teams.",
                    PriceMonthlyCents = 4900,
                    MaxUsers = 25,
                    MaxProjects = 50,
                    IsActive = true
                },
                new SubscriptionPlan
                {
                    Name = "Enterprise",
                    Description = "Advanced security and support.",
                    PriceMonthlyCents = 14900,
                    MaxUsers = 200,
                    MaxProjects = 200,
                    IsActive = true
                }
            );

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
