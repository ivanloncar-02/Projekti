using System.Net;
using System.Text;
using Xunit;

namespace FitnessChallenge.Tests.Integration;

// This is the A4 TODO paid off: CreateActivityRequestDeserializationBoundaryTests
// (A4) only proves JsonException is thrown during deserialization - it says nothing
// about what the API actually returns, since there was no controller yet. This test
// goes through the real ASP.NET Core pipeline and checks the real HTTP response.
public class MalformedRequestIntegrationTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public MalformedRequestIntegrationTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task PostActivities_EmptyBody_Returns400()
    {
        var response = await _client.PostAsync(
            "/api/activities",
            new StringContent(string.Empty, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostActivities_MalformedJson_Returns400()
    {
        var response = await _client.PostAsync(
            "/api/activities",
            new StringContent("{ invalid", Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostUsers_EmptyBody_Returns400()
    {
        var response = await _client.PostAsync(
            "/api/users",
            new StringContent(string.Empty, Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostUsers_MalformedJson_Returns400()
    {
        var response = await _client.PostAsync(
            "/api/users",
            new StringContent("{ invalid", Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
