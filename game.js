const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const W = canvas.width;
const H = canvas.height;

// LOAD IMAGES
const rocketImg = new Image();
const asteroidImg = new Image();

let imagesLoaded = 0;
function checkLoaded() {
    imagesLoaded++;
    if (imagesLoaded === 2) {
        gameLoop();
    }
}

rocketImg.onload = checkLoaded;
asteroidImg.onload = checkLoaded;

rocketImg.src = "rocket.png";      
asteroidImg.src = "asteroid.png";

// GAME STATES
let onStartScreen = true;
let paused = false;
let gameOver = false;
let gameWin = false;

// BUTTON HITBOXES
let startBtn = { x: W / 2 - 150, y: H / 2 + 40, w: 300, h: 60 };
let pauseBtn = { x: W - 140, y: 20, w: 110, h: 40 };
let restartButton = null;

// PLAYER SHIP
let ship = {
    x: W / 2,
    y: H - 100,
    width: 70,
    height: 90,
    speed: 7,
    movingLeft: false,
    movingRight: false,
    rotation: 0
};

// GAME OBJECTS
let asteroids = [];
let coins = [];
let stars = [];
let score = 0;
let distance = 0;
let targetDistance = 1000;

// STARFIELD
for (let i = 0; i < 120; i++) {
    stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 0.5,
        speed: Math.random() * 1.5 + 0.5
    });
}

// CONTROLS
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") ship.movingLeft = true;
    if (e.key === "ArrowRight") ship.movingRight = true;
});

document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowLeft") ship.movingLeft = false;
    if (e.key === "ArrowRight") ship.movingRight = false;
});

// CLICK HANDLER
canvas.addEventListener("click", (e) => {
    const mx = e.offsetX;
    const my = e.offsetY;

    if (onStartScreen) {
        if (mx >= startBtn.x && mx <= startBtn.x + startBtn.w &&
            my >= startBtn.y && my <= startBtn.y + startBtn.h) {
            onStartScreen = false;
            return;
        }
    }

    if (!onStartScreen && !gameOver && !gameWin) {
        if (mx >= pauseBtn.x && mx <= pauseBtn.x + pauseBtn.w &&
            my >= pauseBtn.y && my <= pauseBtn.y + pauseBtn.h) {
            paused = !paused;
            return;
        }
    }

    if (restartButton) {
        const { x, y, w, h } = restartButton;
        if (mx >= x && mx <= x + w && my >= y && my <= y + h) {
            resetGame();
        }
    }
});

// RESET GAME
function resetGame() {
    asteroids = [];
    coins = [];
    score = 0;
    distance = 0;
    gameOver = false;
    gameWin = false;
    paused = false;
    restartButton = null;
    ship.x = W / 2;
    ship.rotation = 0;
    onStartScreen = false;
    gameLoop();
}

// SPAWN OBJECTS
function spawnAsteroid() {
    if (!paused && !gameOver && !gameWin && !onStartScreen) {
        let size = Math.random() * 60 + 60;
        asteroids.push({
            x: Math.random() * (W - size),
            y: -size,
            size: size,
            speed: Math.random() * 2 + 2,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.05
        });
    }
}

function spawnCoin() {
    if (!paused && !gameOver && !gameWin && !onStartScreen) {
        coins.push({
            x: Math.random() * (W - 20) + 10,
            y: -20,
            r: 12,
            speed: 3
        });
    }
}

// UPDATE OBJECTS
function updateAsteroids() {
    for (let a of asteroids) {
        a.y += a.speed;
        a.rotation += a.rotationSpeed;

        if (
            a.y + a.size > ship.y - ship.height / 2 &&
            a.y < ship.y + ship.height / 2 &&
            a.x + a.size > ship.x - ship.width / 2 &&
            a.x < ship.x + ship.width / 2
        ) {
            gameOver = true;
        }
    }
    asteroids = asteroids.filter(a => a.y < H + 200);
}

function updateCoins() {
    for (let c of coins) {
        c.y += c.speed;

        if (
            c.y + c.r > ship.y - ship.height / 2 &&
            c.y - c.r < ship.y + ship.height / 2 &&
            c.x + c.r > ship.x - ship.width / 2 &&
            c.x - c.r < ship.x + ship.width / 2
        ) {
            score += 100;
            c.collected = true;
        }
    }
    coins = coins.filter(c => !c.collected && c.y < H + 50);
}

// DRAW FUNCTIONS
function drawStars() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, W, H);

    for (let s of stars) {
        ctx.fillStyle = `rgba(255,255,255,${0.3 + s.r / 3})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        s.y += s.speed;
        if (s.y > H) {
            s.y = -5;
            s.x = Math.random() * W;
        }
    }
}

function drawShip() {
    ctx.save();

    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.rotation);

    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 25;

    ctx.drawImage(
        rocketImg,
        -ship.width / 2,
        -ship.height / 2,
        ship.width,
        ship.height
    );

    ctx.restore();
}

function drawAsteroids() {
    for (let a of asteroids) {
        ctx.save();
        ctx.translate(a.x + a.size / 2, a.y + a.size / 2);
        ctx.rotate(a.rotation);

        ctx.shadowColor = "#ffffff55";
        ctx.shadowBlur = 20;

        ctx.drawImage(
            asteroidImg,
            -a.size / 2,
            -a.size / 2,
            a.size,
            a.size
        );

        ctx.restore();
    }
}

function drawCoins() {
    for (let c of coins) {
        ctx.shadowColor = "gold";
        ctx.shadowBlur = 20;

        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
    }
}

function drawHUD() {
    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 15;

    ctx.fillStyle = "white";
    ctx.font = "22px Arial";
    ctx.fillText(`Coins: ${score}`, 20, 30);
    ctx.fillText(`Distance: ${distance}`, 20, 60);

    ctx.shadowBlur = 0;
}

function drawPauseButton() {
    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 20;

    ctx.fillStyle = paused ? "#00ffaa" : "#00d9ff";
    ctx.fillRect(pauseBtn.x, pauseBtn.y, pauseBtn.w, pauseBtn.h);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    ctx.font = "18px Arial";
    ctx.fillText(paused ? "PLAY" : "PAUSE", pauseBtn.x + 12, pauseBtn.y + 27);
}

function drawRestartButton() {
    const w = 200;
    const h = 60;
    const x = W / 2 - w / 2;
    const y = H / 2 + 60;

    restartButton = { x, y, w, h };

    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 25;

    ctx.fillStyle = "#00d9ff";
    ctx.fillRect(x, y, w, h);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "black";
    ctx.font = "26px Arial";
    ctx.fillText("RESTART", x + 50, y + 38);
}

// START SCREEN
function drawStartScreen() {
    drawStars();

    ctx.shadowColor = "#00d9ff";
    ctx.shadowBlur = 30;

    ctx.fillStyle = "white";
    ctx.font = "60px Arial";
    ctx.fillText("ORBITER", W / 2 - 150, H / 2 - 40);

    ctx.font = "26px Arial";
    ctx.fillText("Explore. Survive. Connect.", W / 2 - 200, H / 2);

    ctx.shadowBlur = 0;

    ctx.fillStyle = "#00d9ff";
    ctx.fillRect(startBtn.x, startBtn.y, startBtn.w, startBtn.h);

    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText("ENTER ORBIT", startBtn.x + 40, startBtn.y + 40);
}

// MAIN LOOP
function gameLoop() {
    if (onStartScreen) {
        drawStartScreen();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (paused) {
        drawStars();
        drawAsteroids();
        drawCoins();
        drawShip();
        drawHUD();
        drawPauseButton();

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("PAUSED", W / 2 - 80, H / 2);

        requestAnimationFrame(gameLoop);
        return;
    }

    if (gameOver || gameWin) {
        drawStars();
        drawAsteroids();
        drawCoins();
        drawShip();
        drawHUD();
        drawPauseButton();

        ctx.fillStyle = "white";
        ctx.font = "40px Arial";

        if (gameOver) ctx.fillText("GAME OVER", W / 2 - 130, H / 2);
        if (gameWin) ctx.fillText("YOU WIN!", W / 2 - 100, H / 2);

        drawRestartButton();
        return;
    }

    drawStars();
    drawAsteroids();
    drawCoins();
    drawShip();
    drawHUD();
    drawPauseButton();

    updateAsteroids();
    updateCoins();

    // MOVEMENT + TILT
    if (ship.movingLeft && ship.x - ship.width / 2 > 0) {
        ship.x -= ship.speed;
        ship.rotation = Math.max(ship.rotation - 0.1, -0.5);
    } else if (ship.movingRight && ship.x + ship.width / 2 < W) {
        ship.x += ship.speed;
        ship.rotation = Math.min(ship.rotation + 0.1, 0.5);
    } else {
        ship.rotation *= 0.9;
    }

    distance++;

    if (distance >= targetDistance) {
        gameWin = true;
    }

    requestAnimationFrame(gameLoop);
}

// START GAME (after images load)
setInterval(spawnAsteroid, 900);
setInterval(spawnCoin, 1500);