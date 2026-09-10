using System.Net;
using System.Net.Http.Json;
using FitnessChallenge.Api.Dtos;
using Xunit;

namespace FitnessChallenge.Tests.Integration;

// Proves data actually lands in ApiFactory's substituted in-memory connection (and
// not the real fitness.db) by round-tripping a create through the real HTTP pipeline.
public class HappyPathIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public HappyPathIntegrationTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostUsers_ThenGetById_RoundTripsThroughRealPipeline()
    {
        // ApiFactory runs the real Program.cs, which seeds 6 demo users (A9) on an
        // empty database - "Zoran" here is deliberately not one of them (the seeder
        // includes an "Ivan Horvat"), so this doesn't collide with the unique-name
        // constraint and get a 409 instead of the 201 this test actually checks.
        var createResponse = await _client.PostAsJsonAsync("/api/users", new { firstName = "Zoran", lastName = "Test" });
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var created = await createResponse.Content.ReadFromJsonAsync<CreateUserResponse>();
        Assert.NotNull(created);

        var getResponse = await _client.GetAsync($"/api/users/{created!.Id}");
        Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

        var fetched = await getResponse.Content.ReadFromJsonAsync<UserSummaryResponse>();
        Assert.Equal("Zoran", fetched!.FirstName);
    }
}
