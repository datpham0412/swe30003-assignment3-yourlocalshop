namespace Assignment_3_SWE30003.Models;

// Base class implementing the Observer pattern for email notifications, managing observers and triggering notifications.
public class EmailNotifier
{
    private readonly List<EmailSender> _observers = new List<EmailSender>();

    // Registers an email sender to receive notifications.
    public void Attach(EmailSender observer)
    {
        if (!_observers.Contains(observer))
        {
            _observers.Add(observer);
        }
    }

    // Removes an email sender from receiving notifications.
    public void Detach(EmailSender observer)
    {
        _observers.Remove(observer);
    }

    // Notifies all registered observers about an event with the provided data.
    protected void NotifyObservers(string eventType, Dictionary<string, object> data)
    {
        foreach (var observer in _observers)
        {
            observer.Update(eventType, data);
        }
    }
}
