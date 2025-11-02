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

        // Update shipment details (status, delivery date)
        public void UpdateStatus(ShipmentStatus newStatus, DateTime? deliveryDate = null)
        {
            Status = newStatus;
            if (newStatus == ShipmentStatus.Delivered)
                DeliveryDate = deliveryDate ?? DateTime.UtcNow;
        }
        // Notify EmailSender when order is shipped (3.3.6)
        public string NotifyEmailSender()
        {
            if (Status == ShipmentStatus.Dispatched)
            {
                return EmailSender.Send(
                    to: "customer@example.com",
                    subject: $"Shipment Dispatched — Order #{OrderId}",
                    body: $"Your shipment has been dispatched. Tracking number: {TrackingNumber}. You can expect delivery soon."
                );
            }

            if (Status == ShipmentStatus.Delivered)
            {
                return EmailSender.Send(
                    to: "customer@example.com",
                    subject: $"Order Delivered — Order #{OrderId}",
                    body: $"Your order has been successfully delivered to {Address}. Thank you for your business!"
                );
            }

            return string.Empty;
        }
    }
}
