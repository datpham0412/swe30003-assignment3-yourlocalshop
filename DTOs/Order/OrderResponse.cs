using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.DTOs.Order
{
    public class OrderResponse
    {
        public int OrderId { get; set; }
        public OrderStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<OrderLineDto> Lines { get; set; } = new List<OrderLineDto>();
        public decimal Subtotal { get; set; }
        public decimal Tax { get; set; }
        public decimal Total { get; set; }
        public string? ShipmentAddress { get; set; }
        public string? ContactName { get; set; }
        public string? ContactPhone { get; set; }
        public string? Note { get; set; }
        public ShipmentDto? Shipment { get; set; }
    }
}
