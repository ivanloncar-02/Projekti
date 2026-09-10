using FitnessChallenge.Api.Dtos;
using FluentValidation;

namespace FitnessChallenge.Api.Validation;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty().WithMessage("First name is required.").OverridePropertyName("firstName")
            .MaximumLength(100).WithMessage("First name must not exceed 100 characters.");

        RuleFor(x => x.LastName)
            .NotEmpty().WithMessage("Last name is required.").OverridePropertyName("lastName")
            .MaximumLength(100).WithMessage("Last name must not exceed 100 characters.");
    }
}
