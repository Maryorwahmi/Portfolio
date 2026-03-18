namespace Shared.Events;

public interface OrderCreated
{
    Guid OrderId { get; }
    Guid CustomerId { get; }
    decimal TotalAmount { get; }
    List<OrderItem> Items { get; }
}

public interface OrderItem
{
    Guid ProductId { get; }
    int Quantity { get; }
    decimal Price { get; }
}

public interface ReserveInventory
{
    Guid OrderId { get; }
    List<OrderItem> Items { get; }
}

public interface InventoryReserved
{
    Guid OrderId { get; }
}

public interface InventoryFailed
{
    Guid OrderId { get; }
    string Reason { get; }
}

public interface ReleaseInventory
{
    Guid OrderId { get; }
}

public interface ProcessPayment
{
    Guid OrderId { get; }
    decimal Amount { get; }
}

public interface PaymentFailed
{
    Guid OrderId { get; }
    string Reason { get; }
}

public interface OrderPaid
{
    Guid OrderId { get; }
}

public interface ShipOrder
{
    Guid OrderId { get; }
}

public interface UserRegistered
{
    Guid UserId { get; }
    string Email { get; }
}

public interface ProductCreated
{
    Guid ProductId { get; }
    string Name { get; }
    decimal Price { get; }
}
