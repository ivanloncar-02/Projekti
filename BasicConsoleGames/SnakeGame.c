#include <stdio.h>
#include <conio.h>
#include <stdlib.h>
#include <windows.h> // For sleep function

// Define screen size
#define WIDTH 20
#define HEIGHT 20

// Define key codes
#define ESC 27

// Define the Snake structure
typedef struct {
    int x, y;
} Snake;

// Declare the game variables
int gameOver, score;
int x, y, fruitX, fruitY, direction;
Snake snake[100];
int length;

void setup();
void draw();
void input();
void logic();
void generateFruit();

int main() {
    setup();
    while (!gameOver) {
        draw();
        input();
        logic();
        Sleep(115); // Delay to control game speed
    }
    printf("Game Over! Final Score: %d\n", score); 
    return 0;
}

void setup() {
    gameOver = 0;
    direction = 2; // Initially, snake is moving right
    x = WIDTH / 2;
    y = HEIGHT / 2;
    length = 1;
    snake[0].x = x;
    snake[0].y = y;
    score = 0;
    generateFruit();
}

void draw() {
    system("cls"); // Clear the screen (Windows-specific)

    for (int i = 0; i < WIDTH + 2; i++) {
        printf("#");
    }
    printf("\n");

    for (int i = 0; i < HEIGHT; i++) {
        for (int j = 0; j < WIDTH; j++) {
            if (j == 0) {
                printf("#");
            }
            else if (j == WIDTH - 1) {
                printf("#");
            }
            else if (i == y && j == x) {
                printf("O"); //snake head/body
            }
            else if (i == fruitY && j == fruitX) {
                printf("F"); //fruit
            }
            else {
                int print = 0;
                for (int k = 0; k < length; k++) {
                    if (snake[k].x == j && snake[k].y == i) {
                        printf("O"); // Draw snake body
                        print = 1;
                    }
                }
                if (print == 0) {
                    printf(" ");
                }
            }
        }
        printf("\n");
    }

    for (int i = 0; i < WIDTH + 2; i++) {
        printf("#");
    }
    printf("\n");

    printf("Score: %d\n", score);
}

void input() {
    if (_kbhit()) {
        switch (_getch()) {
        case 'a':
            direction = 1;
            break;
        case 'd':
            direction = 2;
            break;
        case 'w':
            direction = 3;
            break;
        case 's':
            direction = 4;
            break;
        case ESC:
            gameOver = 1;
            break;
        }
    }
}

void logic() {
    int prevX = snake[0].x;
    int prevY = snake[0].y;
    int prev2X, prev2Y;
    int tailX, tailY;

    snake[0].x = x;
    snake[0].y = y;

    for (int i = 1; i < length; i++) {
        prev2X = snake[i].x;
        prev2Y = snake[i].y;
        snake[i].x = prevX;
        snake[i].y = prevY;
        prevX = prev2X;
        prevY = prev2Y;
    }

    // Move the snake's head based on direction
    switch (direction) {
    case 1:
        x--;
        break;
    case 2:
        x++;
        break;
    case 3:
        y--;
        break;
    case 4:
        y++;
        break;
    }

    // Check for collision with wall
    if (x >= WIDTH || x < 0 || y >= HEIGHT || y < 0) {
        gameOver = 1;
    }

    // Check for collision with self (snake's body)
    for (int i = 1; i < length; i++) {
        if (snake[i].x == x && snake[i].y == y) {
            gameOver = 1;
        }
    }

    // Check if snake eats fruit
    if (x == fruitX && y == fruitY) {
        score += 1;
        length++;
        generateFruit();
    }
}

void generateFruit() {
    fruitX = rand() % WIDTH;
    fruitY = rand() % HEIGHT;
}
