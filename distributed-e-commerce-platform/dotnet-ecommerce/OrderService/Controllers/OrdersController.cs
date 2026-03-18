using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MassTransit;
using OrderService.Data;
using OrderService.Models;
using Shared.Events;
using System.Security.Claims;

namespace OrderService.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly OrderDbContext _context;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(OrderDbContext context, IPublishEndpoint publishEndpoint, ILogger<OrdersController> logger)
    {
        _context = context;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        
        // Idempotency check: Ensure order hasn't been created already
        if (await _context.Orders.AnyAsync(o => o.IdempotencyKey == request.IdempotencyKey))
        {
            return Conflict("Order already exists");
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customerId,
            TotalAmount = request.Items.Sum(i => i.Price * i.Quantity),
            Status = "Pending",
            IdempotencyKey = request.IdempotencyKey,
            CreatedAt = DateTime.UtcNow
        };

        _context.Orders.Add(order);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Order {OrderId} created for Customer {CustomerId}", order.Id, customerId);

        // Publish event to trigger Saga
        await _publishEndpoint.Publish<OrderCreated>(new
        {
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            TotalAmount = order.TotalAmount,
            Items = request.Items
        });

        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound();

        var customerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        if (order.CustomerId != customerId && !User.IsInRole("Admin"))
            return Forbid();

        return Ok(order);
    }
}

public class CreateOrderRequest
{
    public string IdempotencyKey { get; set; }
    public List<OrderItemDto> Items { get; set; }
}

public class OrderItemDto
{
    public Guid ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}
