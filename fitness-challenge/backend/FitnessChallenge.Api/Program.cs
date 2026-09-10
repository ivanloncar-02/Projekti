using System.Text.Json;
using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Services;
using FitnessChallenge.Api.Validation;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

const string AngularDevClient = "AngularDevClient";

// Add services to the container.

builder.Services.AddControllers().AddJsonOptions(options =>
{
    // The assignment's own "Valid" example JSON has a trailing comma, and reviewers
    // paste examples verbatim - reject nothing a lenient JSON reader would accept.
    options.JsonSerializerOptions.AllowTrailingCommas = true;
    options.JsonSerializerOptions.ReadCommentHandling = JsonCommentHandling.Skip;
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    // Swashbuckle has no native DateOnly support - left unmapped it reflects the
    // struct's public properties into an object schema { year, month, day }, which
    // Swagger UI can't render as a usable date input even though real query-string
    // model binding (?from=2026-06-01) works fine. Map it to what it actually is.
    options.MapType<DateOnly>(() => new Microsoft.OpenApi.Models.OpenApiSchema
    {
        Type = "string",
        Format = "date",
    });
});

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddSingleton<IScoringService, ScoringService>();
builder.Services.AddScoped<IValidator<CreateActivityRequest>, CreateActivityRequestValidator>();
builder.Services.AddScoped<IValidator<CreateUserRequest>, CreateUserRequestValidator>();

builder.Services.AddCors(options =>
{
    options.AddPolicy(AngularDevClient, policy =>
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// No HTTPS redirect: the API runs on plain HTTP in every environment (see CLAUDE.md).
app.UseCors(AngularDevClient);

app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    var scoring = scope.ServiceProvider.GetRequiredService<IScoringService>();
    await DbSeeder.SeedAsync(db, scoring);
}

app.Run();

// Exposes the top-level Program for WebApplicationFactory<Program> in integration tests -
// top-level statement Program.cs generates an internal class by default.
public partial class Program
{
}
