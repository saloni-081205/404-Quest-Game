const is404Page = document.title.includes('404') || 
                  window.location.pathname.includes('404');

if (!is404Page) {
    document.getElementById('homeButton').style.display = 'inline-block';
}


function initGame() {
    createStars();
    createGameGrid();
    updateUI();
    setupEventListeners();

    // Show "Return Home" button only in standalone mode
    if (!is404Page) {
        document.getElementById('homeButton').style.display = 'inline-block';
    }
}

// Game state
let gameState = {
    player: {
        position: { x: 2, y: 7 },
        direction: 'right',
        isMoving: false
    },
    showDialog: false,
    currentRiddle: 0,
    showPortal: false,
    gameCompleted: false
};

// Game constants
const GRID_SIZE = { width: 12, height: 10 };
const WIZARD_POSITION = { x: 7, y: 4 };

// Riddles data
const riddles = [
    {
        question: "To escape this digital realm, tell me: What does HTML stand for?",
        options: [
            "Hyper Tool Make Logic",
            "HyperText Markup Language", 
            "Highly Typed Markdown Logic",
            "Home Text Management Library"
        ],
        correctAnswer: 1
    },
    {
        question: "A wise choice! Now answer this: Which CSS property creates rounded corners?",
        options: [
            "corner-radius",
            "round-corners", 
            "border-radius",
            "edge-curve"
        ],
        correctAnswer: 2
    },
    {
        question: "Excellent! Final challenge: What does API stand for?",
        options: [
            "Application Programming Interface",
            "Advanced Program Integration", 
            "Automated Process Instruction",
            "Applied Programming Intelligence"
        ],
        correctAnswer: 0
    }
];

// Initialize game
function initGame() {
    createStars();
    createGameGrid();
    updateUI();
    setupEventListeners();
}

//stars background
function createStars() {
    const starsContainer = document.querySelector('.stars');
    starsContainer.innerHTML = '';
    
    for (let i = 0; i < 50; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.animationDuration = (2 + Math.random() * 2) + 's';
        starsContainer.appendChild(star);
    }
}

//game grid
function createGameGrid() {
    const gameGrid = document.getElementById('gameGrid');
    gameGrid.innerHTML = '';
    
    for (let y = 0; y < GRID_SIZE.height; y++) {
        for (let x = 0; x < GRID_SIZE.width; x++) {
            const tile = document.createElement('div');
            tile.className = `tile tile-forest-${(x + y) % 4}`;
            tile.id = `tile-${x}-${y}`;
            
            // Add forest decorations
            const hasTree = (x + y * 3) % 7 === 0 && 
                           !(x === gameState.player.position.x && y === gameState.player.position.y) &&
                           !(x === WIZARD_POSITION.x && y === WIZARD_POSITION.y) &&
                           !(gameState.showPortal && x === 9 && y === 2);
            
            const hasBush = (x * 2 + y) % 5 === 0 && !hasTree &&
                           !(x === gameState.player.position.x && y === gameState.player.position.y) &&
                           !(x === WIZARD_POSITION.x && y === WIZARD_POSITION.y) &&
                           !(gameState.showPortal && x === 9 && y === 2);
            
            if (hasTree) {
                const tree = document.createElement('div');
                tree.className = 'tree';
                tree.innerHTML = '<div class="tree-trunk"></div><div class="tree-leaves"></div>';
                tile.appendChild(tree);
            } else if (hasBush) {
                const bush = document.createElement('div');
                bush.className = 'bush';
                tile.appendChild(bush);
            }
            
            gameGrid.appendChild(tile);
        }
    }
    
    updateCharacters();
}

// Update character positions
function updateCharacters() {
    // Clear existing characters
    document.querySelectorAll('.player, .wizard, .portal').forEach(el => el.remove());
    
    // Add player
    const playerTile = document.getElementById(`tile-${gameState.player.position.x}-${gameState.player.position.y}`);
    if (playerTile) {
        const player = document.createElement('div');
        player.className = `player ${gameState.player.isMoving ? 'moving' : ''}`;
        player.innerHTML = `<img src="images/player.gif" alt="Player character">`;
        playerTile.appendChild(player);
    }
    
    // Add wizard
    const wizardTile = document.getElementById(`tile-${WIZARD_POSITION.x}-${WIZARD_POSITION.y}`);
    if (wizardTile) {
        const wizard = document.createElement('div');
        wizard.className = 'wizard';
        wizard.innerHTML = `<img src="images/wizard.gif" alt="Wizard character">`;
        wizardTile.appendChild(wizard);
    }
    
    // Add portal if unlocked (keeping the original portal animation)
    if (gameState.showPortal) {
        const portalTile = document.getElementById('tile-9-2');
        if (portalTile) {
            const portal = document.createElement('div');
            portal.className = 'portal';
            portal.innerHTML = `
                <div class="portal-ring">
                    <div class="portal-inner">
                        <div class="portal-core">
                            <div class="portal-center"></div>
                        </div>
                    </div>
                </div>
                <div class="portal-particles">
                    ${Array.from({length: 8}, (_, i) => 
                        `<div class="portal-particle" style="
                            left: ${Math.cos(i * Math.PI / 4) * 20 + 20}px;
                            top: ${Math.sin(i * Math.PI / 4) * 20 + 20}px;
                            animation-delay: ${i * 0.2}s;
                        "></div>`
                    ).join('')}
                </div>
            `;
            portalTile.appendChild(portal);
        }
    }
}


// Check if player is near wizard
function isNearWizard() {
    const distance = Math.abs(gameState.player.position.x - WIZARD_POSITION.x) + 
                    Math.abs(gameState.player.position.y - WIZARD_POSITION.y);
    return distance <= 1;
}

// Move player
function movePlayer(direction) {
    if (gameState.showDialog) return;
    
    const newPosition = { ...gameState.player.position };
    
    switch (direction) {
        case 'up':
            newPosition.y = Math.max(0, newPosition.y - 1);
            break;
        case 'down':
            newPosition.y = Math.min(GRID_SIZE.height - 1, newPosition.y + 1);
            break;
        case 'left':
            newPosition.x = Math.max(0, newPosition.x - 1);
            break;
        case 'right':
            newPosition.x = Math.min(GRID_SIZE.width - 1, newPosition.x + 1);
            break;
    }
    
    gameState.player.position = newPosition;
    gameState.player.direction = direction;
    gameState.player.isMoving = true;
    
    updateCharacters();
    
    // Check if near wizard
    if (isNearWizard() && !gameState.gameCompleted) {
        showDialog();
    }
    
    // Reset moving state
    setTimeout(() => {
        gameState.player.isMoving = false;
        updateCharacters();
    }, 200);
}

// dialog
function showDialog() {
    gameState.showDialog = true;
    const currentRiddle = riddles[gameState.currentRiddle];
    
    document.getElementById('riddleQuestion').textContent = currentRiddle.question;
    
    const optionsContainer = document.getElementById('riddleOptions');
    optionsContainer.innerHTML = '';
    
    currentRiddle.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'riddle-option';
        button.innerHTML = `<span class="option-letter">(${String.fromCharCode(65 + index)})</span>${option}`;
        button.onclick = () => handleRiddleAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('dialogOverlay').style.display = 'flex';
}

// Handle riddle answer
function handleRiddleAnswer(answerIndex) {
    const currentRiddle = riddles[gameState.currentRiddle];
    const isCorrect = answerIndex === currentRiddle.correctAnswer;
    
    if (isCorrect) {
        gameState.currentRiddle++;
        
        if (gameState.currentRiddle >= riddles.length) {
            // All riddles solved
            gameState.gameCompleted = true;
            gameState.showPortal = true;
            localStorage.setItem('404-quest-completed', 'true');
            closeDialog();
            updateCharacters();
            updateUI();
        } else {
            // Show next riddle
            setTimeout(() => {
                showDialog();
            }, 500);
        }
    } else {
        // Wrong answer - show feedback
        const optionsContainer = document.getElementById('riddleOptions');
        const buttons = optionsContainer.querySelectorAll('.riddle-option');
        buttons[answerIndex].style.background = '#dc2626';
        buttons[answerIndex].style.borderColor = '#ef4444';
        
        setTimeout(() => {
            showDialog();
        }, 1000);
    }
}

// Close dialog
function closeDialog() {
    gameState.showDialog = false;
    document.getElementById('dialogOverlay').style.display = 'none';
}

// Update UI
function updateUI() {
    const instructions = document.getElementById('instructions');
    const portalMessage = document.getElementById('portalMessage');
    const homeButton = document.getElementById('homeButton');
    const progress = document.getElementById('progress');
    
    if (gameState.gameCompleted) {
        instructions.style.display = 'none';
        portalMessage.style.display = 'block';
        homeButton.style.display = 'inline-block';
        progress.textContent = '🎉 Quest Complete! You are now a pixel master!';
    } else {
        instructions.style.display = 'block';
        portalMessage.style.display = 'none';
        homeButton.style.display = 'none';
        progress.textContent = 'Lost in the 404 Forest... Find the wizard to escape!';
    }
}

// Restart game
function restartGame() {
    gameState = {
        player: {
            position: { x: 2, y: 7 },
            direction: 'right',
            isMoving: false
        },
        showDialog: false,
        currentRiddle: 0,
        showPortal: false,
        gameCompleted: false
    };
    
    closeDialog();
    createGameGrid();
    updateUI();
}

// Go home
function goHome() {
    window.location.href = 'index.html';
}

// Setup event listeners
function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (gameState.showDialog && e.key === 'Escape') {
            closeDialog();
            return;
        }
        
        if (gameState.showDialog) return;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                movePlayer('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                movePlayer('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                movePlayer('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                movePlayer('right');
                break;
        }
    });
    
    // Dialog overlay click to close
    document.getElementById('dialogOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'dialogOverlay') {
            closeDialog();
        }
    });
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initGame);
