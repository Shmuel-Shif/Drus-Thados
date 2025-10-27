// משתני המשחק
let canvas, ctx;
let gameRunning = false;
let score = 0;
let lives = 3;
let carX = 200; // מיקום המכונית (מרכז)
let carY = 0; // מיקום אנכי של המכונית
let carWidth = 40;
let carHeight = 60;
let roadWidth = 400;
let carSpeed = 5;
let carVerticalSpeed = 0; // מהירות אנכית של המכונית

// תמונות
let dosImage = new Image();
let obstacleImage = new Image();

// מערכים לאובייקטים
let dosim = []; // דוסים
let obstacles = []; // מכשולים
let explosions = []; // פיצוצים
let squashedDosim = []; // דוסים דרוסים (אפקט זמני)

// הגדרות אובייקטים
const dosWidth = 40;
const dosHeight = 70;
const obstacleWidth = 60 ;
const obstacleHeight = 40;

// מהירות אובייקטים
let objectSpeed = 3;

// משתנה לאפקט פסי כביש זזים
let roadOffset = 0;

// משתני שליטה
let keys = {};
let leftPressed = false;
let rightPressed = false;
let forwardPressed = false;
let backwardPressed = false;

// אתחול המשחק
function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // טעינת תמונות
    dosImage.src = 'Doss.png';
    obstacleImage.src = 'images.png';
    
    // הגדרת אירועי מקלדת
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // הגדרת כפתורי מובייל
    document.getElementById('leftBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        leftPressed = true;
    });
    
    document.getElementById('leftBtn').addEventListener('touchend', (e) => {
        e.preventDefault();
        leftPressed = false;
    });
    
    document.getElementById('rightBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        rightPressed = true;
    });
    
    document.getElementById('rightBtn').addEventListener('touchend', (e) => {
        e.preventDefault();
        rightPressed = false;
    });
    
    document.getElementById('forwardBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        forwardPressed = true;
    });
    
    document.getElementById('forwardBtn').addEventListener('touchend', (e) => {
        e.preventDefault();
        forwardPressed = false;
    });
    
    document.getElementById('backwardBtn').addEventListener('touchstart', (e) => {
        e.preventDefault();
        backwardPressed = true;
    });
    
    document.getElementById('backwardBtn').addEventListener('touchend', (e) => {
        e.preventDefault();
        backwardPressed = false;
    });
    
    // כפתורי התחלה וסיום
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    // התחלת לולאת המשחק
    gameLoop();
}

// טיפול במקשי מקלדת
function handleKeyDown(e) {
    keys[e.key] = true;
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
    if (e.key === 'ArrowUp') forwardPressed = true;
    if (e.key === 'ArrowDown') backwardPressed = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
    if (e.key === 'ArrowUp') forwardPressed = false;
    if (e.key === 'ArrowDown') backwardPressed = false;
}

// התחלת המשחק
function startGame() {
    gameRunning = true;
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    
    // איפוס משתנים
    score = 0;
    lives = 3;
    carX = 200;
    carY = canvas.height - carHeight - 20; // התחלה מלמטה
    carVerticalSpeed = 0;
    dosim = [];
    obstacles = [];
    explosions = [];
    squashedDosim = [];
    objectSpeed = 3;
    
    updateHUD();
}

// הפעלת המשחק מחדש
function restartGame() {
    startGame();
}

// עדכון HUD
function updateHUD() {
    document.getElementById('score').textContent = score;
    let hearts = '';
    for (let i = 0; i < lives; i++) {
        hearts += '❤️';
    }
    document.getElementById('lives').textContent = hearts;
}

// יצירת דוס
function createDos() {
    if (Math.random() < 0.02) { // 2% סיכוי בכל פריים
        const x = Math.random() * (roadWidth - dosWidth);
        dosim.push({
            x: x,
            y: -dosHeight,
            width: dosWidth,
            height: dosHeight
        });
    }
}

// יצירת מכשול
function createObstacle() {
    if (Math.random() < 0.015) { // 1.5% סיכוי בכל פריים
        const x = Math.random() * (roadWidth - obstacleWidth);
        obstacles.push({
            x: x,
            y: -obstacleHeight,
            width: obstacleWidth,
            height: obstacleHeight
        });
    }
}

// עדכון מיקום המכונית
function updateCar() {
    if (leftPressed && carX > 0) {
        carX -= carSpeed;
    }
    if (rightPressed && carX < roadWidth - carWidth) {
        carX += carSpeed;
    }
    if (forwardPressed) {
        // האצה - המכונית נעה מהר יותר
        objectSpeed = Math.min(objectSpeed + 0.1, 8); // מקסימום מהירות 8
        // תנועה קדימה במסך (למעלה)
        carVerticalSpeed = Math.min(carVerticalSpeed + 0.5, 3); // מקסימום מהירות אנכית 3
    } else if (backwardPressed) {
        // האטה - המכונית נעה לאט יותר
        objectSpeed = Math.max(objectSpeed - 0.1, 1); // מינימום מהירות 1
        // תנועה אחורה במסך (למטה)
        carVerticalSpeed = Math.max(carVerticalSpeed - 0.5, -3); // מינימום מהירות אנכית -3
    } else {
        // חזרה למהירות רגילה
        objectSpeed = Math.max(objectSpeed - 0.05, 3); // מינימום מהירות 3
        // האטה תנועה אנכית
        carVerticalSpeed = Math.max(carVerticalSpeed - 0.3, 0); // מינימום מהירות אנכית 0
    }
    
    // עדכון מיקום אנכי של המכונית (קדימה = למעלה)
    carY -= carVerticalSpeed;
    
    // הגבלת תנועה אנכית - המכונית לא יכולה לצאת מהמסך
    const maxCarY = canvas.height - carHeight - 20;
    const minCarY = 0;
    if (carY > maxCarY) {
        carY = maxCarY;
        carVerticalSpeed = 0;
    }
    if (carY < minCarY) {
        carY = minCarY;
        carVerticalSpeed = 0;
    }
}

// עדכון אובייקטים
function updateObjects() {
    // עדכון אפקט פסי הכביש
    roadOffset += objectSpeed;
    
    // עדכון דוסים
    for (let i = dosim.length - 1; i >= 0; i--) {
        dosim[i].y += objectSpeed;
        
        // הסרת דוסים שיצאו מהמסך
        if (dosim[i].y > canvas.height) {
            dosim.splice(i, 1);
        }
    }
    
    // עדכון מכשולים
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += objectSpeed;
        
        // הסרת מכשולים שיצאו מהמסך
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
        }
    }
    
    // עדכון פיצוצים
    for (let i = explosions.length - 1; i >= 0; i--) {
        explosions[i].life--;
        explosions[i].size += 2;
        explosions[i].opacity -= 0.05;
        
        // הסרת פיצוצים שהסתיימו
        if (explosions[i].life <= 0 || explosions[i].opacity <= 0) {
            explosions.splice(i, 1);
        }
    }
    
    // עדכון דוסים דרוסים (אפקט זמני)
    for (let i = squashedDosim.length - 1; i >= 0; i--) {
        squashedDosim[i].life--;
        
        // הסרת דוסים דרוסים אחרי זמן קצר
        if (squashedDosim[i].life <= 0) {
            squashedDosim.splice(i, 1);
        }
    }
}

// בדיקת התנגשויות
function checkCollisions() {
    const carRect = {
        x: carX,
        y: carY,
        width: carWidth,
        height: carHeight
    };
    
    // בדיקת התנגשות עם דוסים
    for (let i = dosim.length - 1; i >= 0; i--) {
        if (isColliding(carRect, dosim[i])) {
            score += 10;
            
            // יצירת אפקט דוס דרוס זמני
            squashedDosim.push({
                x: dosim[i].x,
                y: dosim[i].y,
                width: dosim[i].width,
                height: dosim[i].height,
                life: 30 // אפקט קצר של 30 פריימים
            });
            
            dosim.splice(i, 1);
            document.getElementById('score').classList.add('score-animation');
            setTimeout(() => {
                document.getElementById('score').classList.remove('score-animation');
            }, 300);
        }
    }
    
    // בדיקת התנגשות עם מכשולים
    for (let i = obstacles.length - 1; i >= 0; i--) {
        if (isColliding(carRect, obstacles[i])) {
            lives--;
            
            // יצירת פיצוץ במקום ההתנגשות
            explosions.push({
                x: carRect.x + carRect.width / 2,
                y: carRect.y + carRect.height / 2,
                size: 10,
                life: 20,
                opacity: 1
            });
            
            obstacles.splice(i, 1);
            updateHUD();
            
            if (lives <= 0) {
                gameOver();
            }
        }
    }
}

// פונקציית בדיקת התנגשות
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// סיום המשחק
function gameOver() {
    gameRunning = false;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

// רישום המשחק
function draw() {
    // ניקוי הקנבס
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // רקע כביש
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // קווי כביש זזים
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);
    
    // קו אמצע זז - פשוט ומושלם
    ctx.beginPath();
    let y = roadOffset % 40;
    while (y < canvas.height) {
        ctx.moveTo(canvas.width / 2, y);
        ctx.lineTo(canvas.width / 2, y + 20);
        y += 40;
    }
    ctx.stroke();
    
    // קווי צד זזים - פשוט ומושלם
    ctx.beginPath();
    y = roadOffset % 40;
    while (y < canvas.height) {
        ctx.moveTo(50, y);
        ctx.lineTo(50, y + 20);
        y += 40;
    }
    ctx.stroke();
    
    ctx.beginPath();
    y = roadOffset % 40;
    while (y < canvas.height) {
        ctx.moveTo(canvas.width - 50, y);
        ctx.lineTo(canvas.width - 50, y + 20);
        y += 40;
    }
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // רישום דוסים עם תמונות
    dosim.forEach(dos => {
        if (dosImage.complete) {
            ctx.drawImage(dosImage, dos.x, dos.y, dos.width, dos.height);
        } else {
            // גיבוי - אם התמונה לא נטענה עדיין
            ctx.fillStyle = '#f39c12';
            ctx.fillRect(dos.x, dos.y, dos.width, dos.height);
            // עיניים לדוס
            ctx.fillStyle = 'black';
            ctx.fillRect(dos.x + 5, dos.y + 5, 5, 5);
            ctx.fillRect(dos.x + 20, dos.y + 5, 5, 5);
            ctx.fillStyle = '#f39c12';
        }
    });
    
    // רישום דוסים דרוסים (אפקט זמני)
    squashedDosim.forEach(squashedDos => {
        ctx.save();
        
        if (dosImage.complete) {
            // סיבוב התמונה ב-90 מעלות ימינה כדי שתראה שוכבת
            const centerX = squashedDos.x + squashedDos.width / 2;
            const centerY = squashedDos.y + squashedDos.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.rotate(Math.PI / 2); // 90 מעלות ימינה
            
            // שימוש בפרופורציות נכונות - רוחב הופך לגובה ולהיפך
            ctx.drawImage(dosImage, -squashedDos.width / 2, -squashedDos.height / 2, squashedDos.width, squashedDos.height);
        } else {
            // גיבוי - דוס דרוס פשוט שוכב
            ctx.fillStyle = '#e67e22'; // צבע כהה יותר לדוס מת
            ctx.fillRect(squashedDos.x, squashedDos.y, squashedDos.width, squashedDos.height);
            
            // עיניים מתות (X במקום נקודות)
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(squashedDos.x + 5, squashedDos.y + 5);
            ctx.lineTo(squashedDos.x + 10, squashedDos.y + 10);
            ctx.moveTo(squashedDos.x + 10, squashedDos.y + 5);
            ctx.lineTo(squashedDos.x + 5, squashedDos.y + 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(squashedDos.x + 20, squashedDos.y + 5);
            ctx.lineTo(squashedDos.x + 25, squashedDos.y + 10);
            ctx.moveTo(squashedDos.x + 25, squashedDos.y + 5);
            ctx.lineTo(squashedDos.x + 20, squashedDos.y + 10);
            ctx.stroke();
        }
        
        ctx.restore();
    });
    
    // רישום מכשולים עם תמונות
    obstacles.forEach(obstacle => {
        if (obstacleImage.complete) {
            ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        } else {
            // גיבוי - אם התמונה לא נטענה עדיין
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            // צלב על המכשול
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(obstacle.x + obstacle.width/2, obstacle.y);
            ctx.lineTo(obstacle.x + obstacle.width/2, obstacle.y + obstacle.height);
            ctx.moveTo(obstacle.x, obstacle.y + obstacle.height/2);
            ctx.lineTo(obstacle.x + obstacle.width, obstacle.y + obstacle.height/2);
            ctx.stroke();
        }
    });
    
    // רישום פיצוצים
    explosions.forEach(explosion => {
        ctx.save();
        ctx.globalAlpha = explosion.opacity;
        
        // פיצוץ עם גרדיאנט
        const gradient = ctx.createRadialGradient(
            explosion.x, explosion.y, 0,
            explosion.x, explosion.y, explosion.size
        );
        gradient.addColorStop(0, '#FFD700');
        gradient.addColorStop(0.3, '#FF6B35');
        gradient.addColorStop(0.7, '#FF1744');
        gradient.addColorStop(1, 'rgba(255, 23, 68, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(explosion.x, explosion.y, explosion.size, 0, 2 * Math.PI);
        ctx.fill();
        
        // חלקיקים קטנים
        ctx.fillStyle = '#FFD700';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * 2 * Math.PI;
            const particleX = explosion.x + Math.cos(angle) * explosion.size * 0.7;
            const particleY = explosion.y + Math.sin(angle) * explosion.size * 0.7;
            ctx.fillRect(particleX - 2, particleY - 2, 4, 4);
        }
        
        ctx.restore();
    });
    
    // רישום המכונית
    ctx.fillStyle = '#3498db';
    ctx.fillRect(carX, carY, carWidth, carHeight);
    
    // חלונות המכונית
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(carX + 5, carY + 5, carWidth - 10, 15);
    ctx.fillRect(carX + 5, carY + 25, carWidth - 10, 15);
    
    // גלגלים
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(carX - 5, carY - 5, 10, 10);
    ctx.fillRect(carX + carWidth - 5, carY - 5, 10, 10);
    ctx.fillRect(carX - 5, carY + carHeight - 5, 10, 10);
    ctx.fillRect(carX + carWidth - 5, carY + carHeight - 5, 10, 10);
}

// לולאת המשחק הראשית
function gameLoop() {
    if (gameRunning) {
        updateCar();
        createDos();
        createObstacle();
        updateObjects();
        checkCollisions();
        
        // הגדלת מהירות עם הזמן
        if (score > 0 && score % 200 === 0) {
            objectSpeed += 0.1;
        }
    }
    
    draw();
    updateHUD();
    requestAnimationFrame(gameLoop);
}

// התחלת המשחק כשהדף נטען
window.addEventListener('load', initGame);
