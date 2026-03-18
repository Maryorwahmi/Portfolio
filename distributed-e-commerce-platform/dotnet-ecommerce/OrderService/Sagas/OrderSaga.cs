using MassTransit;
using OrderService.Data;
using OrderService.Models;
using Shared.Events;

namespace OrderService.Sagas;

public class OrderSaga :
    MassTransitStateMachine<OrderState>
{
    public State Pending { get; private set; }
    public State Paid { get; private set; }
    public State Shipped { get; private set; }
    public State Completed { get; private set; }
    public State Failed { get; private set; }

    public Event<OrderCreated> OrderCreatedEvent { get; private set; }
    public Event<InventoryReserved> InventoryReservedEvent { get; private set; }
    public Event<InventoryFailed> InventoryFailedEvent { get; private set; }
    public Event<OrderPaid> OrderPaidEvent { get; private set; }
    public Event<PaymentFailed> PaymentFailedEvent { get; private set; }

    public OrderSaga()
    {
        InstanceState(x => x.CurrentState);

        Event(() => OrderCreatedEvent, x => x.CorrelateById(context => context.Message.OrderId));
        Event(() => InventoryReservedEvent, x => x.CorrelateById(context => context.Message.OrderId));
        Event(() => InventoryFailedEvent, x => x.CorrelateById(context => context.Message.OrderId));
        Event(() => OrderPaidEvent, x => x.CorrelateById(context => context.Message.OrderId));
        Event(() => PaymentFailedEvent, x => x.CorrelateById(context => context.Message.OrderId));

        Initially(
            When(OrderCreatedEvent)
                .Then(context =>
                {
                    context.Saga.OrderId = context.Message.OrderId;
                    context.Saga.CustomerId = context.Message.CustomerId;
                    context.Saga.TotalAmount = context.Message.TotalAmount;
                    context.Saga.CreatedAt = DateTime.UtcNow;
                })
                .TransitionTo(Pending)
                .PublishAsync(context => context.Init<ReserveInventory>(new
                {
                    OrderId = context.Saga.OrderId,
                    Items = context.Message.Items
                }))
        );

        During(Pending,
            When(InventoryReservedEvent)
                .TransitionTo(Paid) // State is transitioning to processing payment
                .PublishAsync(context => context.Init<ProcessPayment>(new
                {
                    OrderId = context.Saga.OrderId,
                    Amount = context.Saga.TotalAmount
                })),
            
            When(InventoryFailedEvent)
                .Then(context =>
                {
                    context.Saga.FailureReason = context.Message.Reason;
                })
                .TransitionTo(Failed)
        );

        During(Paid, // This state is technically "PaymentProcessing" now
            When(OrderPaidEvent)
                .TransitionTo(Shipped)
                .PublishAsync(context => context.Init<ShipOrder>(new
                {
                    OrderId = context.Saga.OrderId
                })),
                
            When(PaymentFailedEvent)
                .Then(context =>
                {
                    context.Saga.FailureReason = context.Message.Reason;
                })
                .TransitionTo(Failed)
                .PublishAsync(context => context.Init<ReleaseInventory>(new
                {
                    OrderId = context.Saga.OrderId
                }))
        );
    }
}

public class OrderState : SagaStateMachineInstance
{
    public Guid CorrelationId { get; set; }
    public string CurrentState { get; set; }
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string FailureReason { get; set; }
}
