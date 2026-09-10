namespace FitnessChallenge.Api.Models;

public class User
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;

    // Backs the case-insensitive uniqueness constraint on (FirstName, LastName).
    // Owned entirely by this factory so it can never drift out of sync with the name
    // fields - callers (including the A5 UsersController) only ever see FirstName/LastName.
    public string NormalizedName { get; private set; } = default!;

    public DateTimeOffset CreatedAt { get; private set; }
    public ICollection<Activity> Activities { get; private set; } = new List<Activity>();

    private User()
    {
    }

    public static User Create(string firstName, string lastName)
    {
        firstName = firstName.Trim();
        lastName = lastName.Trim();

        return new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            NormalizedName = Normalize(firstName, lastName),
            CreatedAt = DateTimeOffset.UtcNow,
        };
    }

    private static string Normalize(string firstName, string lastName)
    {
        var words = $"{firstName} {lastName}".Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        return string.Join(' ', words).ToUpperInvariant();
    }
}
