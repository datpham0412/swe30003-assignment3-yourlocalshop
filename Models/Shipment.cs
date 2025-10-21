namespace Assignment_3_SWE30003.Models
{
    public enum ShipmentStatus
    {
        Pending,
        Dispatched,
        InTransit,
        Delivered
    }

    public class Shipment
    {
        public int Id { get; set; }
        public int OrderId { get; set; }
        public string Address { get; set; } = default!;
        public string ContactName { get; set; } = default!;
        public string TrackingNumber { get; set; } = default!;
        public ShipmentStatus Status { get; private set; } = ShipmentStatus.Pending;
        public DateTime? DeliveryDate { get; private set; }

        public Order Order { get; set; } = default!;

        public void UpdateStatus(ShipmentStatus newStatus, DateTime? deliveryDate = null)
        {
            Status = newStatus;
            if (newStatus == ShipmentStatus.Delivered)
                DeliveryDate = deliveryDate ?? DateTime.UtcNow;
        }

        public string NotifyEmailSender()
        {
            if (Status == ShipmentStatus.Dispatched)
                return $"Email notification: Order {Order.Id} has been dispatched. Tracking number: {TrackingNumber}";
            if (Status == ShipmentStatus.Delivered)
                return $"Email notification: Order {Order.Id} has been delivered to {Address}";
            return string.Empty;
        }
    }
}
