namespace Assignment_3_SWE30003.Models;

// EmailNotifier class that manages email observers and notifies them of events
public class EmailNotifier
{
    private readonly List<EmailSender> _observers = new List<EmailSender>();

    // Attach an observer
    public void Attach(EmailSender observer)
    {
        if (!_observers.Contains(observer))
        {
            _observers.Add(observer);
        }
    }

    // Detach an observer
    public void Detach(EmailSender observer)
    {
        _observers.Remove(observer);
    }

    // Notify all observers about an event
    protected void NotifyObservers(string eventType, Dictionary<string, object> data)
    {
        foreach (var observer in _observers)
        {
            observer.Update(eventType, data);
        }
    }
}
