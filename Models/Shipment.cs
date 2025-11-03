namespace Assignment_3_SWE30003.Models
{
    public enum ShipmentStatus
    {
        Pending,
        Dispatched,
        InTransit,
        Delivered
    }

    public class Shipment : EmailNotifier
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Address { get; set; } = default!;
        public string ContactName { get; set; } = default!;
        public string TrackingNumber { get; set; } = default!;
        public ShipmentStatus Status { get; private set; } = ShipmentStatus.Pending;
        public DateTime? DeliveryDate { get; private set; }

        public Order Order { get; set; } = default!;

        // Update shipment details (status, delivery date)
        public void UpdateStatus(ShipmentStatus newStatus, string customerEmail, DateTime? deliveryDate = null)
        {
            Status = newStatus;
            if (newStatus == ShipmentStatus.Delivered)
                DeliveryDate = deliveryDate ?? DateTime.UtcNow;
            
            // Notify observers only when dispatched
            if (newStatus == ShipmentStatus.Dispatched)
            {
                NotifyObservers("ShipmentDispatched", new Dictionary<string, object>
                {
                    { "Email", customerEmail },
                    { "OrderId", OrderId },
                    { "TrackingNumber", TrackingNumber }
                });
            }
        }
    }
}
