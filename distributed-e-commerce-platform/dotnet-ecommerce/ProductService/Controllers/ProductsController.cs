using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Distributed;
using ProductService.Data;
using ProductService.Models;
using System.Text.Json;
using MassTransit;
using Shared.Events;

namespace ProductService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly ProductDbContext _context;
    private readonly IDistributedCache _cache;
    private readonly IPublishEndpoint _publishEndpoint;
    private readonly ILogger<ProductsController> _logger;

    public ProductsController(ProductDbContext context, IDistributedCache cache, IPublishEndpoint publishEndpoint, ILogger<ProductsController> logger)
    {
        _context = context;
        _cache = cache;
        _publishEndpoint = publishEndpoint;
        _logger = logger;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts()
    {
        var cacheKey = "products_list";
        var cachedProducts = await _cache.GetStringAsync(cacheKey);

        if (!string.IsNullOrEmpty(cachedProducts))
        {
            _logger.LogInformation("Returning products from cache");
            return Ok(JsonSerializer.Deserialize<List<Product>>(cachedProducts));
        }

        var products = await _context.Products.ToListAsync();
        
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10)
        };
        await _cache.SetStringAsync(cacheKey, JsonSerializer.Serialize(products), cacheOptions);

        _logger.LogInformation("Returning products from database");
        return Ok(products);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Category = request.Category
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        // Invalidate cache
        await _cache.RemoveAsync("products_list");

        _logger.LogInformation("Product {ProductId} created", product.Id);

        await _publishEndpoint.Publish<ProductCreated>(new
        {
            ProductId = product.Id,
            Name = product.Name,
            Price = product.Price
        });

        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }
}

public class CreateProductRequest
{
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public string Category { get; set; }
}
