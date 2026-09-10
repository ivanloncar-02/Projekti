using System.Text.Json;
using FitnessChallenge.Api.Dtos;
using Xunit;

namespace FitnessChallenge.Tests.Validation;

// These document the JSON deserialization boundary, not the API contract: a malformed
// value here throws JsonException before a CreateActivityRequest object - and therefore
// FluentValidation - ever sees it. There is no controller yet (that's A6), so the only
// thing provable right now is that deserialization itself rejects these inputs.
//
// TODO(A6): once the controller exists, add an integration test that POSTs each of
// these payloads and asserts the API actually responds 400 (ASP.NET Core's [ApiController]
// automatic invalid-model-state behavior should cover it, but that needs to be verified
// against a real HTTP pipeline, not assumed from this test class).
public class CreateActivityRequestDeserializationBoundaryTests
{
    // Mirrors ASP.NET Core's default System.Text.Json options (camelCase policy,
    // case-insensitive matching) so lowercase JSON keys bind the same way they would
    // through the real pipeline.
    private static readonly JsonSerializerOptions Options = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    [Fact]
    public void EmptyBody_ThrowsOnDeserialize()
    {
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CreateActivityRequest>("", Options));
    }

    [Fact]
    public void MalformedJson_ThrowsOnDeserialize()
    {
        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CreateActivityRequest>("{ invalid", Options));
    }

    [Fact]
    public void NonIso8601Datetime_ThrowsOnDeserialize()
    {
        const string json = """{ "datetime": "not-a-date" }""";

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CreateActivityRequest>(json, Options));
    }

    [Fact]
    public void NonNumericDistance_ThrowsOnDeserialize()
    {
        const string json = """{ "distance": "abc" }""";

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CreateActivityRequest>(json, Options));
    }

    [Fact]
    public void NonIntegerSteps_ThrowsOnDeserialize()
    {
        const string json = """{ "steps": 3.5 }""";

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<CreateActivityRequest>(json, Options));
    }
}
