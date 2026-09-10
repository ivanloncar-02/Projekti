using FitnessChallenge.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Activity> Activities => Set<Activity>();

    // Applies to every DateTimeOffset property on every entity, so a future entity
    // can't accidentally end up with the un-ordered raw mapping (see the converter
    // for why: Sqlite refuses to translate ORDER BY / comparisons on DateTimeOffset).
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
    {
        configurationBuilder.Properties<DateTimeOffset>().HaveConversion<UtcDateTimeOffsetConverter>();
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
            entity.Property(u => u.NormalizedName).IsRequired().HasMaxLength(201);

            // Case-insensitive uniqueness on (FirstName, LastName) via the normalized
            // column - see User.Create. A plain index on the raw columns would be
            // case-sensitive on SQLite.
            entity.HasIndex(u => u.NormalizedName).IsUnique();

            entity.HasMany(u => u.Activities)
                .WithOne(a => a.User)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
