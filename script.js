let board = document.getElementById("board");
let solution = [];
let puzzle = [];
let timerInterval;
let startTime;

/* CREATE GRID */
function createGrid() {
    board.innerHTML = "";
    for (let i = 0; i < 81; i++) {
        let input = document.createElement("input");
        input.className = "cell";
        input.maxLength = 1;

        input.oninput = () => {
            input.value = input.value.replace(/[^1-9]/g, "");
        };

        board.appendChild(input);
    }
}

/* SHUFFLE */
function shuffle(arr) {
    return arr.sort(() => Math.random() - 0.5);
}

/* VALID CHECK */
function valid(grid, r, c, n) {
    for (let i = 0; i < 9; i++) {
        if (grid[r][i] === n || grid[i][c] === n) return false;
    }

    let br = Math.floor(r / 3) * 3;
    let bc = Math.floor(c / 3) * 3;

    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            if (grid[br + i][bc + j] === n) return false;

    return true;
}

/* GENERATE SOLUTION */
function generateSolution() {
    let grid = Array(9).fill().map(() => Array(9).fill(0));

    function solve() {
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if (grid[r][c] === 0) {
                    let nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

                    for (let n of nums) {
                        if (valid(grid, r, c, n)) {
                            grid[r][c] = n;
                            if (solve()) return true;
                            grid[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve();
    return grid;
}

/* MAKE PUZZLE */
function makePuzzle(sol, diff) {
    let p = sol.map(r => [...r]);

    let remove = diff === "Basic" ? 30 :
        diff === "Intermediate" ? 40 : 50;

    while (remove > 0) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);

        if (p[r][c] !== 0) {
            p[r][c] = 0;
            remove--;
        }
    }
    return p;
}

/* RENDER */
function render() {
    let cells = document.querySelectorAll(".cell");

    for (let i = 0; i < 81; i++) {
        let r = Math.floor(i / 9);
        let c = i % 9;

        cells[i].classList.remove("prefilled", "wrong");

        if (puzzle[r][c] !== 0) {
            cells[i].value = puzzle[r][c];
            cells[i].disabled = true;
            cells[i].classList.add("prefilled");
        } else {
            cells[i].value = "";
            cells[i].disabled = false;
        }
    }
}

/* NEW GAME */
function newGame() {
    solution = generateSolution();
    let diff = document.getElementById("difficulty").value;
    puzzle = makePuzzle(solution, diff);

    render();
    startTimer();
}

/* TIMER */
function startTimer() {
    clearInterval(timerInterval);
    startTime = Date.now();

    timerInterval = setInterval(() => {
        let t = Math.floor((Date.now() - startTime) / 1000);
        document.getElementById("timer").innerText = t;
    }, 1000);
}

/* CHECK */
function check() {
    let cells = document.querySelectorAll(".cell");
    let correct = true;

    cells.forEach((cell, i) => {
        let r = Math.floor(i / 9);
        let c = i % 9;

        if (cell.value != solution[r][c]) {
            cell.classList.add("wrong");
            correct = false;
        }
    });

    if (correct) {
        clearInterval(timerInterval);
        saveScore();
        celebrate();
        document.getElementById("winSound").play();
    }
}

/* RESET */
function resetBoard() {
    render();
}

/* HINT */
function hint() {
    let cells = document.querySelectorAll(".cell");

    for (let i = 0; i < 81; i++) {
        let r = Math.floor(i / 9);
        let c = i % 9;

        if (!cells[i].disabled && cells[i].value != solution[r][c]) {
            cells[i].value = solution[r][c];
            return;
        }
    }
}

/* LEADERBOARD */
function saveScore() {
    let diff = document.getElementById("difficulty").value;
    let time = parseInt(document.getElementById("timer").innerText);

    let scores = JSON.parse(localStorage.getItem(diff)) || [];

    scores.push(time);
    scores.sort((a, b) => a - b);
    scores = scores.slice(0, 5);

    localStorage.setItem(diff, JSON.stringify(scores));
    showScores();
}

function showScores() {
    let levels = ["Basic", "Intermediate", "Advanced"];
    let html = "";

    levels.forEach(level => {
        let scores = JSON.parse(localStorage.getItem(level)) || [];
        html += `<h4>${level}</h4>`;

        scores.forEach((s, i) => {
            html += `<p>#${i + 1} - ${s}s</p>`;
        });
    });

    document.getElementById("scores").innerHTML = html;
}

/* CELEBRATION */
function celebrate() {
    const canvas = document.getElementById("celebration");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for (let i = 0; i < 150; i++) {
        particles.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: (Math.random() - 0.5) * 10,
            dy: (Math.random() - 0.5) * 10,
            size: Math.random() * 5
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            ctx.fillStyle = "cyan";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;
        });

        requestAnimationFrame(draw);
    }

    draw();

    setTimeout(() => canvas.width = 0, 2000);
}

/* INIT */
createGrid();
showScores();
newGame();