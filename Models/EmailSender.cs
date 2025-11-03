namespace Assignment_3_SWE30003.Models;

// Observer class that receives notifications from EmailNotifier classes
public class EmailSender
{
    // Called by EmailNotifier when an event occurs
    public void Update(string eventType, Dictionary<string, object> data)
    {
        switch (eventType)
        {
            case "AccountCreated":
                SendAccountCreationEmail(data);
                break;
            case "PaymentCompleted":
                SendPaymentConfirmationEmail(data);
                break;
            case "InvoiceGenerated":
                SendInvoiceEmail(data);
                break;
            case "ShipmentDispatched":
                SendShipmentDispatchedEmail(data);
                break;
        }
    }

    private void SendAccountCreationEmail(Dictionary<string, object> data)
    {
        var email = data["Email"] as string ?? "unknown@example.com";
        var name = data["Name"] as string ?? "Customer";
        
        Send(
            to: email,
            subject: "Welcome! Your Account Has Been Created",
            body: $"Hello {name},\n\nYour account has been successfully created. Welcome to our store!\n\nEmail: {email}\n\nThank you for joining us!"
        );
    }

    private void SendPaymentConfirmationEmail(Dictionary<string, object> data)
    {
        var email = data["Email"] as string ?? "customer@example.com";
        var orderId = data["OrderId"];
        var amount = data["Amount"];
        
        Send(
            to: email,
            subject: $"Payment Confirmation — Order #{orderId}",
            body: $"Your payment of ${amount:F2} for Order #{orderId} has been successfully processed.\n\nThank you for your purchase!"
        );
    }

    private void SendInvoiceEmail(Dictionary<string, object> data)
    {
        var email = data["Email"] as string ?? "customer@example.com";
        var invoiceNumber = data["InvoiceNumber"] as string;
        var amount = data["Amount"];
        var orderId = data["OrderId"];
        
        Send(
            to: email,
            subject: $"Invoice {invoiceNumber} — Order #{orderId}",
            body: $"Your invoice has been generated.\n\nInvoice Number: {invoiceNumber}\nOrder ID: {orderId}\nAmount: ${amount:F2}\n\nThank you for your business!"
        );
    }

    private void SendShipmentDispatchedEmail(Dictionary<string, object> data)
    {
        var email = data["Email"] as string ?? "customer@example.com";
        var orderId = data["OrderId"];
        var trackingNumber = data["TrackingNumber"] as string;
        
        Send(
            to: email,
            subject: $"Shipment Dispatched — Order #{orderId}",
            body: $"Your shipment has been dispatched.\n\nTracking Number: {trackingNumber}\nYou can expect delivery soon.\n\nThank you!"
        );
    }

    // Core email sending method (3.3.14)
    private void Send(string to, string subject, string body)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\n📧 Email Sent To: {to}");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine($"Body: {body}\n");
        Console.ResetColor();
    }
}
