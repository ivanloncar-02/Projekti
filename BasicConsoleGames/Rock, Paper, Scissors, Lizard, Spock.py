import random

# Function to determine the winner
def determine_winner(player_choice, computer_choice):
    # Define winning conditions
    winning_combinations = {
        'rock': ['scissors', 'lizard'],
        'paper': ['rock', 'spock'],
        'scissors': ['paper', 'lizard'],
        'lizard': ['spock', 'paper'],
        'spock': ['scissors', 'rock']
    }

    if player_choice == computer_choice:
        return "It's a tie!"
    elif computer_choice in winning_combinations[player_choice]:
        return "You win!"
    else:
        return "You lose!"

def play_game():
    choices = ['rock', 'paper', 'scissors', 'lizard', 'spock']

    print("Welcome to Rock, Paper, Scissors, Lizard, Spock!")
    print("Your options are:")
    print("rock, paper, scissors, lizard, spock")

    # Player input
    player_choice = input("Enter your choice: ").lower()

    # Validate player choice
    if player_choice not in choices:
        print("Invalid choice. Please choose from rock, paper, scissors, lizard, or spock.")
        return

    # Computer choice
    computer_choice = random.choice(choices)
    print(f"Computer chose: {computer_choice}")

    result = determine_winner(player_choice, computer_choice)
    print(result)

def main():
    while True:
        play_game()

        play_again = input("Do you want to play again? (yes/no): ").lower()
        if play_again != 'yes':
            print("Thanks for playing!")
            break

if __name__ == "__main__":
    main()
