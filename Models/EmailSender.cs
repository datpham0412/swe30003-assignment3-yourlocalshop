namespace Assignment_3_SWE30003.Models;

public static class EmailSender
{
    // Send confirmation email for completed order to user (3.3.14)
    public static string Send(string to, string subject, string body)
    {
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"\n📧 Email Sent To: {to}");
        Console.WriteLine($"Subject: {subject}");
        Console.WriteLine($"Body: {body}\n");
        Console.ResetColor();
        return $"✅ Email sent to {to}: {subject}";
    }
}
