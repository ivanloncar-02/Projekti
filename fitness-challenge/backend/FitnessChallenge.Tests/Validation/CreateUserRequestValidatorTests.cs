using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Validation;
using Xunit;

namespace FitnessChallenge.Tests.Validation;

public class CreateUserRequestValidatorTests
{
    private readonly CreateUserRequestValidator _sut = new();

    [Fact]
    public async Task Valid_Passes()
    {
        var request = new CreateUserRequest { FirstName = "Ivan", LastName = "Horvat" };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Invalid_FirstName_MissingOrBlank_Fails(string? firstName)
    {
        var request = new CreateUserRequest { FirstName = firstName, LastName = "Horvat" };

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "firstName");
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    public async Task Invalid_LastName_MissingOrBlank_Fails(string? lastName)
    {
        var request = new CreateUserRequest { FirstName = "Ivan", LastName = lastName };

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "lastName");
    }

    [Fact]
    public async Task Invalid_FirstName_TooLong_Fails()
    {
        var request = new CreateUserRequest { FirstName = new string('a', 101), LastName = "Horvat" };

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "firstName");
    }

    [Fact]
    public async Task Invalid_LastName_TooLong_Fails()
    {
        var request = new CreateUserRequest { FirstName = "Ivan", LastName = new string('a', 101) };

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "lastName");
    }

    [Fact]
    public async Task Valid_ExactlyMaxLength_Passes()
    {
        var request = new CreateUserRequest { FirstName = new string('a', 100), LastName = new string('b', 100) };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }
}
