#include <iostream>
#include <vector>
#include <conio.h>  // Za _kbhit() i _getch()
#include <windows.h>  // Za Sleep()

using namespace std;

const int WIDTH = 50;
const int HEIGHT = 20;

class Bullet {
public:
    int x, y;
    bool active;

    Bullet() : x(0), y(0), active(false) {}

    void shoot(int startX, int startY) {
        x = startX;
        y = startY;
        active = true;
    }

    void update() {
        if (active) {
            y--;
            if (y < 0) {
                active = false;
            }
        }
    }
};

class Enemy {
public:
    int x, y;

    Enemy(int startX, int startY) : x(startX), y(startY) {}

    void move() {
        y++;
        if (y >= HEIGHT) {
            y = 0;
            x = rand() % WIDTH;
        }
    }

    void draw() {
        cout << "E";
    }
};

class Player {
public:
    int x, y;

    Player() : x(WIDTH / 2), y(HEIGHT - 1) {}

    void move(char input) {
        if (input == 'a' && x > 0) x--;
        if (input == 'd' && x < WIDTH - 1) x++;
    }

    void draw() {
        cout << "P";
    }
};

class Game {
private:
    Player player;
    vector<Bullet> bullets;
    vector<Enemy> enemies;
    int score;

public:
    Game() : score(0) {
        for (int i = 0; i < 5; i++) {
            enemies.push_back(Enemy(rand() % WIDTH, rand() % HEIGHT));
        }
    }

    void input() {
        if (_kbhit()) {
            char key = _getch();
            if (key == 'a' || key == 'd') {
                player.move(key);
            }
            if (key == ' ') {
                Bullet bullet;
                bullet.shoot(player.x, player.y - 1);
                bullets.push_back(bullet);
            }
        }
    }

    void update() {
        for (auto& bullet : bullets) {
            bullet.update();
        }
        for (auto& enemy : enemies) {
            enemy.move();
        }
    }

    void draw() {
        system("cls");  // Oèisti ekran
        for (int i = 0; i < WIDTH + 2; i++) cout << "#";
        cout << endl;

        for (int y = 0; y < HEIGHT; y++) {
            for (int x = 0; x < WIDTH; x++) {
                bool drawn = false;
                if (player.y == y && player.x == x) {
                    player.draw();
                    drawn = true;
                }
                for (auto& bullet : bullets) {
                    if (bullet.y == y && bullet.x == x && bullet.active) {
                        cout << "|";
                        drawn = true;
                    }
                }
                for (auto& enemy : enemies) {
                    if (enemy.y == y && enemy.x == x) {
                        enemy.draw();
                        drawn = true;
                    }
                }
                if (!drawn) {
                    cout << " ";
                }
            }
            cout << endl;
        }

        for (int i = 0; i < WIDTH + 2; i++) cout << "#";
        cout << endl;

        cout << "Score: " << score << endl;
    }

    void checkCollisions() {
        for (auto& bullet : bullets) {
            if (bullet.active) {
                for (auto& enemy : enemies) {
                    if (bullet.x == enemy.x && bullet.y == enemy.y) {
                        bullet.active = false;
                        enemy.y = 0;
                        enemy.x = rand() % WIDTH;
                        score += 10;
                    }
                }
            }
        }
    }

    bool isGameOver() {
        for (auto& enemy : enemies) {
            if (enemy.y == player.y && enemy.x == player.x) {
                return true;
            }
        }
        return false;
    }

    void run() {
        while (!isGameOver()) {
            input();
            update();
            checkCollisions();
            draw();
            Sleep(100);  // Pauza da bi igra bila usporena
        }
        cout << "Game Over!" << endl;
    }
};

int main() {
    Game game;
    game.run();
    return 0;
}
