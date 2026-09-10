using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Models;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Tests.Validation;

// In-memory Sqlite kept alive for the lifetime of the fixture (the connection must stay
// open for the in-memory DB to survive between queries), seeded with one user so the
// validator's "userId exists" MustAsync rule has something real to check against.
public class ActivityValidatorFixture : IDisposable
{
    private readonly SqliteConnection _connection;

    public AppDbContext Db { get; }
    public Guid ExistingUserId { get; }

    public ActivityValidatorFixture()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        Db = new AppDbContext(options);
        Db.Database.EnsureCreated();

        var user = User.Create("Ivan", "Horvat");
        Db.Users.Add(user);
        Db.SaveChanges();

        ExistingUserId = user.Id;
    }

    public void Dispose()
    {
        Db.Dispose();
        _connection.Dispose();
    }
}
