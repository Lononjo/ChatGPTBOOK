class AttorneyMazeGame {
    constructor() {
        this.level = 1;
        this.moves = 0;
        this.casesCollected = 0;
        this.totalCases = 0;
        this.startTime = null;
        this.timerInterval = null;
        this.maze = [];
        this.player = { x: 0, y: 0 };
        this.goal = { x: 0, y: 0 };
        this.cases = [];
        this.mazeSize = 11; // Odd number for better maze generation

        this.init();
    }

    init() {
        this.generateMaze();
        this.render();
        this.setupEventListeners();
        this.startTimer();
    }

    generateMaze() {
        // Initialize maze with all walls
        const size = this.mazeSize + (this.level - 1) * 2;
        this.maze = Array(size).fill().map(() => Array(size).fill(1));

        // Recursive backtracking maze generation
        const stack = [];
        const startX = 1;
        const startY = 1;

        this.maze[startY][startX] = 0;
        stack.push([startX, startY]);

        const directions = [
            [0, -2], [2, 0], [0, 2], [-2, 0] // Up, Right, Down, Left
        ];

        while (stack.length > 0) {
            const [x, y] = stack[stack.length - 1];
            const neighbors = [];

            for (const [dx, dy] of directions) {
                const nx = x + dx;
                const ny = y + dy;

                if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && this.maze[ny][nx] === 1) {
                    neighbors.push([nx, ny, dx, dy]);
                }
            }

            if (neighbors.length > 0) {
                const [nx, ny, dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
                this.maze[ny][nx] = 0;
                this.maze[y + dy / 2][x + dx / 2] = 0;
                stack.push([nx, ny]);
            } else {
                stack.pop();
            }
        }

        // Set player position (top-left area)
        this.player = { x: 1, y: 1 };

        // Set goal position (bottom-right area)
        this.goal = { x: size - 2, y: size - 2 };
        this.maze[this.goal.y][this.goal.x] = 0;

        // Place case files randomly
        this.cases = [];
        const numCases = Math.min(3 + this.level, 10);
        this.totalCases = numCases;

        for (let i = 0; i < numCases; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (size - 2)) + 1;
                y = Math.floor(Math.random() * (size - 2)) + 1;
            } while (
                this.maze[y][x] === 1 ||
                (x === this.player.x && y === this.player.y) ||
                (x === this.goal.x && y === this.goal.y) ||
                this.cases.some(c => c.x === x && c.y === y)
            );
            this.cases.push({ x, y });
        }
    }

    render() {
        const canvas = document.getElementById('gameCanvas');
        const size = this.maze.length;

        canvas.style.gridTemplateColumns = `repeat(${size}, 40px)`;
        canvas.innerHTML = '';

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                }

                // Check if this is the player position
                if (x === this.player.x && y === this.player.y) {
                    cell.classList.add('player');
                    cell.textContent = '👔'; // Attorney
                }
                // Check if this is the goal position
                else if (x === this.goal.x && y === this.goal.y) {
                    cell.classList.add('goal');
                    cell.textContent = '🏛️'; // Courtroom
                }
                // Check if this is a case file position
                else if (this.cases.some(c => c.x === x && c.y === y)) {
                    cell.classList.add('case');
                    cell.textContent = '📂'; // Case file
                }

                canvas.appendChild(cell);
            }
        }

        this.updateStats();
    }

    updateStats() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('cases').textContent = `${this.casesCollected}/${this.totalCases}`;
        document.getElementById('moves').textContent = this.moves;
    }

    startTimer() {
        this.startTime = Date.now();
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            document.getElementById('timer').textContent = `${minutes}:${seconds}`;
        }, 1000);
    }

    move(dx, dy) {
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;

        // Check boundaries and walls
        if (newX < 0 || newX >= this.maze[0].length ||
            newY < 0 || newY >= this.maze.length ||
            this.maze[newY][newX] === 1) {
            return;
        }

        this.player.x = newX;
        this.player.y = newY;
        this.moves++;

        // Check if player collected a case file
        const caseIndex = this.cases.findIndex(c => c.x === newX && c.y === newY);
        if (caseIndex !== -1) {
            this.cases.splice(caseIndex, 1);
            this.casesCollected++;
        }

        // Check if player reached the goal
        if (newX === this.goal.x && newY === this.goal.y) {
            this.levelComplete();
            return;
        }

        this.render();
    }

    levelComplete() {
        clearInterval(this.timerInterval);
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        const modal = document.getElementById('modal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalStats = document.getElementById('modalStats');
        const modalButton = document.getElementById('modalButton');

        modalTitle.textContent = '🎉 Case Closed!';
        modalMessage.textContent = `You successfully navigated to the courtroom!`;
        modalStats.innerHTML = `
            <p><strong>Level ${this.level} Complete</strong></p>
            <p>Moves: ${this.moves}</p>
            <p>Time: ${minutes}:${seconds.toString().padStart(2, '0')}</p>
            <p>Case Files Collected: ${this.casesCollected}/${this.totalCases}</p>
        `;

        modal.classList.remove('hidden');

        modalButton.onclick = () => {
            modal.classList.add('hidden');
            this.nextLevel();
        };
    }

    nextLevel() {
        this.level++;
        this.moves = 0;
        this.casesCollected = 0;
        this.mazeSize = 11;
        this.generateMaze();
        this.render();
        this.startTimer();
    }

    resetLevel() {
        this.moves = 0;
        this.casesCollected = 0;
        this.generateMaze();
        this.render();
        this.startTimer();
    }

    newGame() {
        this.level = 1;
        this.moves = 0;
        this.casesCollected = 0;
        this.mazeSize = 11;
        this.generateMaze();
        this.render();
        this.startTimer();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    this.move(0, -1);
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    this.move(0, 1);
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.move(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.move(1, 0);
                    e.preventDefault();
                    break;
            }
        });

        document.getElementById('newGame').addEventListener('click', () => {
            this.newGame();
        });

        document.getElementById('resetLevel').addEventListener('click', () => {
            this.resetLevel();
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new AttorneyMazeGame();
});
