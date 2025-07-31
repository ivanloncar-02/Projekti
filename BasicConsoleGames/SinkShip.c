#define _CRT_SECURE_NO_WARNINGS

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

#define BOARD_SIZE 10
#define MAX_SHIP_SIZE 6
#define MIN_SHIP_SIZE 2

// Board initialization and display functions
void initializeBoard(char board[BOARD_SIZE][BOARD_SIZE]);
void printBoard(char board[BOARD_SIZE][BOARD_SIZE]);

// Ship placement functions
int isValidPosition(char board[BOARD_SIZE][BOARD_SIZE], int x, int y, int size, int horizontal);
void placeShip(char board[BOARD_SIZE][BOARD_SIZE], int x, int y, int size, int horizontal);

// Game mechanics
int attack(char board[BOARD_SIZE][BOARD_SIZE], int x, int y);
int isGameOver(char board[BOARD_SIZE][BOARD_SIZE]);

int main() {
    srand(time(NULL));

    char playerBoard[BOARD_SIZE][BOARD_SIZE];
    int shipSizes[] = { 2, 3, 4, 5, 6 };
    int numShips = sizeof(shipSizes) / sizeof(shipSizes[0]);

    // Initialize game board
    initializeBoard(playerBoard);

    // Randomly place ships of varying sizes
    for (int i = 0; i < numShips; i++) {
        int size = shipSizes[i];
        int placed = 0;
        while (!placed) {
            int x = rand() % BOARD_SIZE;
            int y = rand() % BOARD_SIZE;
            int horizontal = rand() % 2; // 0 for vertical, 1 for horizontal
            if (isValidPosition(playerBoard, x, y, size, horizontal)) {
                placeShip(playerBoard, x, y, size, horizontal);
                placed = 1;
            }
        }
    }

    // Start the game
    int moves = 0;
    while (!isGameOver(playerBoard)) {
        int x, y;
        printBoard(playerBoard);
        printf("Enter attack coordinates (x y): ");
        scanf("%d %d", &x, &y);

        if (attack(playerBoard, x, y)) {
            printf("Hit!\n");
        }
        else {
            printf("Miss!\n");
        }

        moves++;
    }

    printf("You won in %d moves!\n", moves);
    return 0;
}

// Initialize the board with empty water cells
void initializeBoard(char board[BOARD_SIZE][BOARD_SIZE]) {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = '~'; // '~' represents water
        }
    }
}

// Print the current game board
void printBoard(char board[BOARD_SIZE][BOARD_SIZE]) {
    printf("\n  ");
    for (int i = 0; i < BOARD_SIZE; i++) {
        printf("%d ", i);
    }
    printf("\n");

    for (int i = 0; i < BOARD_SIZE; i++) {
        printf("%d ", i);
        for (int j = 0; j < BOARD_SIZE; j++) {
            printf("%c ", board[i][j]);
        }
        printf("\n");
    }
    printf("\n");
}

// Check if the ship can be placed at the given coordinates
int isValidPosition(char board[BOARD_SIZE][BOARD_SIZE], int x, int y, int size, int horizontal) {
    if (horizontal) {
        if (y + size > BOARD_SIZE) return 0; // Ship would exceed board width
        for (int i = y; i < y + size; i++) {
            if (board[x][i] != '~') return 0; // Spot is already taken
        }
    }
    else {
        if (x + size > BOARD_SIZE) return 0; // Ship would exceed board height
        for (int i = x; i < x + size; i++) {
            if (board[i][y] != '~') return 0; // Spot is already taken
        }
    }
    return 1; // Valid placement
}

// Place the ship on the board
void placeShip(char board[BOARD_SIZE][BOARD_SIZE], int x, int y, int size, int horizontal) {
    if (horizontal) {
        for (int i = y; i < y + size; i++) {
            board[x][i] = '#'; // '#' represents a part of a ship
        }
    }
    else {
        for (int i = x; i < x + size; i++) {
            board[i][y] = '#'; // '#' represents a part of a ship
        }
    }
}

// Attack a position on the board
int attack(char board[BOARD_SIZE][BOARD_SIZE], int x, int y) {
    if (board[x][y] == '#') {
        board[x][y] = 'X'; // 'X' represents a hit
        return 1; // Hit
    }
    else if (board[x][y] == '~') {
        board[x][y] = 'O'; // 'O' represents a miss
        return 0; // Miss
    }
    return -1; // Already attacked
}

// Check if all ships have been sunk
int isGameOver(char board[BOARD_SIZE][BOARD_SIZE]) {
    for (int i = 0; i < BOARD_SIZE; i++) {
        for (int j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] == '#') {
                return 0; // Ships still remain
            }
        }
    }
    return 1; // All ships have been sunk
}
