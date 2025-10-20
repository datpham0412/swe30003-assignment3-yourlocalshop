using Assignment_3_SWE30003.Models;

namespace Assignment_3_SWE30003.DTOs
{
    public class ShipmentDto
    {
        public int ShipmentId { get; set; }
        public string TrackingNumber { get; set; } = default!;
        public ShipmentStatus Status { get; set; }
        public string Address { get; set; } = default!;
        public string ContactName { get; set; } = default!;
        public DateTime? DeliveryDate { get; set; }
    }
}
