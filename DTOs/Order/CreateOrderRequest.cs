namespace Assignment_3_SWE30003.DTOs.Order
{
    public class CreateOrderRequest
    {
        public string ShipmentAddress { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string ContactPhone { get; set; } = string.Empty;
        public string? Note { get; set; }
    }
}
