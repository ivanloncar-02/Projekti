using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace FitnessChallenge.Api.Data;

// Gives EF Core design-time tooling (dotnet-ef, and any IDE feature built on the same
// Microsoft.EntityFrameworkCore.Design infrastructure) a dedicated way to construct an
// AppDbContext without running Program.cs's full hosting pipeline.
//
// Without this, EF's tooling falls back to HostFactoryResolver, which executes
// Program.cs's entire top-level statement list up to (but not including) app.Run() -
// including the Database.Migrate() call, against the REAL "Data Source=fitness.db"
// connection string. That's how a design-time-only operation (generating a migration,
// or an IDE's background model inspection) ends up silently writing to the real
// database file as a side effect. IDesignTimeDbContextFactory is checked first and
// short-circuits that fallback entirely - this factory never calls Migrate(), so
// nothing here can touch the real file beyond opening a connection to it.
public class DesignTimeAppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
        optionsBuilder.UseSqlite(configuration.GetConnectionString("Default") ?? "Data Source=fitness.db");

        return new AppDbContext(optionsBuilder.Options);
    }
}
