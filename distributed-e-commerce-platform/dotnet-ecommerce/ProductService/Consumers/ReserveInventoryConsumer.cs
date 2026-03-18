using MassTransit;
using ProductService.Data;
using Shared.Events;

namespace ProductService.Consumers;

public class ReserveInventoryConsumer : IConsumer<ReserveInventory>
{
    private readonly ProductDbContext _dbContext;
    private readonly ILogger<ReserveInventoryConsumer> _logger;

    public ReserveInventoryConsumer(ProductDbContext dbContext, ILogger<ReserveInventoryConsumer> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    public async Task Consume(ConsumeContext<ReserveInventory> context)
    {
        _logger.LogInformation("Attempting to reserve inventory for Order {OrderId}", context.Message.OrderId);

        using var transaction = await _dbContext.Database.BeginTransactionAsync();
        try
        {
            foreach (var item in context.Message.Items)
            {
                var product = await _dbContext.Products.FindAsync(item.ProductId);
                if (product == null || product.StockQuantity < item.Quantity)
                {
                    _logger.LogWarning("Inventory reservation failed for Order {OrderId}: Insufficient stock for Product {ProductId}", context.Message.OrderId, item.ProductId);
                    await context.Publish<InventoryFailed>(new
                    {
                        OrderId = context.Message.OrderId,
                        Reason = $"Insufficient stock for product {item.ProductId}"
                    });
                    return;
                }

                product.StockQuantity -= item.Quantity;
            }

            await _dbContext.SaveChangesAsync();
            await transaction.CommitAsync();

            _logger.LogInformation("Successfully reserved inventory for Order {OrderId}", context.Message.OrderId);
            await context.Publish<InventoryReserved>(new
            {
                OrderId = context.Message.OrderId
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            _logger.LogError(ex, "Error reserving inventory for Order {OrderId}", context.Message.OrderId);
            
            // Re-throw to allow MassTransit retry/DLQ mechanism to handle it
            throw;
        }
    }
}
