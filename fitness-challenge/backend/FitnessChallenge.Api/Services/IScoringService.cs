using FitnessChallenge.Api.Models;

namespace FitnessChallenge.Api.Services;

public interface IScoringService
{
    int Calculate(Activity activity);
}
