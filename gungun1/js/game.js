// 游戏配置
const CONFIG = {
    gridSize: 8,
    emojis: ['🏍️', '🐶', '⛷️', '🏄', '🤿', '🍲', '🚗'],
    rainbowEmoji: '🌈',
    // 特殊元素标记
    powerups: {
        stripeH: 'stripe-h',  // 水平条纹
        stripeV: 'stripe-v',  // 垂直条纹
        bomb: 'bomb',         // 炸弹
        rainbow: 'rainbow'   // 彩虹球
    },
    // 关卡配置 - 改为收集目标系统
    levelConfigs: [
        {
            moves: 20,
            targets: [
                { emoji: '🏍️', collected: 0, goal: 10 },
                { emoji: '🐶', collected: 0, goal: 10 }
            ],
            hint: '4个连成直线可消除整行或整列！'
        },
        {
            moves: 18,
            targets: [
                { emoji: '⛷️', collected: 0, goal: 15 },
                { emoji: '🏄', collected: 0, goal: 15 }
            ],
            hint: 'L型或T型消除生成炸弹！'
        },
        {
            moves: 15,
            targets: [
                { emoji: '🤿', collected: 0, goal: 15 },
                { emoji: '🍲', collected: 0, goal: 15 }
            ],
            hint: '炸弹可以消除周围3x3范围！'
        },
        {
            moves: 15,
            targets: [
                { emoji: '🚗', collected: 0, goal: 20 },
                { emoji: '🏍️', collected: 0, goal: 20 }
            ],
            hint: '条纹+炸弹=消除整行+整列！'
        },
        {
            moves: 12,
            targets: [
                { emoji: '🐶', collected: 0, goal: 25 },
                { emoji: '⛷️', collected: 0, goal: 25 }
            ],
            hint: '5个连成直线生成彩虹球！'
        }
    ],
    messages: [
        '你真的很棒！',
        '进步越来越大了！',
        '太厉害了，我的宝贝！',
        '简直无人能挡！',
        '就是无敌的存在！'
    ],
    encouragingMessages: [
        '努力的女孩最可爱',
        '坚持就是胜利',
        '相信自己可以的',
        '你比想象中更厉害',
        '每一步都是进步'
    ],
    // 连击加成配置
    comboMultipliers: {
        1: 1,
        2: 1.5,
        3: 2
    }
};

// 游戏状态
let gameState = {
    board: [],           // 游戏板 - 存储 {emoji, powerup} 对象
    selectedTile: null,
    score: 0,
    moves: 0,
    level: 1,
    isAnimating: false,
    combo: 0,            // 连击数
    targets: [],         // 当前关卡目标
    hintUsed: false      // 本关是否使用过提示
};

// DOM 元素
const elements = {
    loadingScreen: document.getElementById('loading-screen'),
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    levelCompleteScreen: document.getElementById('level-complete-screen'),
    endingScreen: document.getElementById('ending-screen'),
    gameOverScreen: document.getElementById('game-over-screen'),
    gameBoard: document.getElementById('game-board'),
    scoreDisplay: document.getElementById('score'),
    movesDisplay: document.getElementById('moves'),
    levelDisplay: document.getElementById('level-num'),
    targetDisplay: document.getElementById('target-score'),
    levelMessage: document.getElementById('level-message'),
    loadingMessage: document.querySelector('.loading-message'),
    loadingBar: document.querySelector('.loading-bar')
};

// 初始化游戏
function init() {
    // 加载动画
    animateLoading();
}

// 加载界面动画
function animateLoading() {
    let messageIndex = 0;
    const loadingInterval = setInterval(() => {
        elements.loadingMessage.textContent = CONFIG.encouragingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % CONFIG.encouragingMessages.length;
    }, 800);

    setTimeout(() => {
        clearInterval(loadingInterval);
        showScreen('start');
    }, 2500);
}

// 屏幕切换
function showScreen(screenName) {
    const screens = ['loadingScreen', 'startScreen', 'gameScreen', 'levelCompleteScreen', 'endingScreen', 'gameOverScreen'];

    screens.forEach(screen => {
        elements[screen].classList.add('hidden');
    });

    const targetScreen = screenName + 'Screen';
    if (elements[targetScreen]) {
        elements[targetScreen].classList.remove('hidden');
    }
}

// 开始游戏
function startGame() {
    const levelConfig = CONFIG.levelConfigs[0];

    gameState = {
        board: [],
        selectedTile: null,
        score: 0,
        moves: levelConfig.moves,
        level: 1,
        isAnimating: false,
        combo: 0,
        targets: JSON.parse(JSON.stringify(levelConfig.targets)), // 深拷贝
        hintUsed: false
    };

    updateUI();
    generateBoard();
    showScreen('game');

    // 显示本关提示
    setTimeout(() => {
        showLevelHint(levelConfig.hint);
    }, 500);
}

// 显示关卡提示
function showLevelHint(hint) {
    const hintDiv = document.createElement('div');
    hintDiv.className = 'level-hint';
    hintDiv.textContent = hint;
    elements.gameScreen.appendChild(hintDiv);

    setTimeout(() => {
        hintDiv.remove();
    }, 3000);
}

// 生成游戏板
function generateBoard() {
    elements.gameBoard.innerHTML = '';
    gameState.board = [];

    for (let row = 0; row < CONFIG.gridSize; row++) {
        gameState.board[row] = [];
        for (let col = 0; col < CONFIG.gridSize; col++) {
            let emoji;
            do {
                emoji = CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)];
            } while (wouldCreateMatch(row, col, emoji));

            gameState.board[row][col] = { emoji: emoji, powerup: null };
            createTileElement(row, col, emoji);
        }
    }
}

// 检查是否会创建匹配
function wouldCreateMatch(row, col, emoji) {
    // 检查水平方向
    if (col >= 2 &&
        gameState.board[row][col - 1]?.emoji === emoji &&
        gameState.board[row][col - 2]?.emoji === emoji) {
        return true;
    }
    // 检查垂直方向
    if (row >= 2 &&
        gameState.board[row - 1] && gameState.board[row - 1][col]?.emoji === emoji &&
        gameState.board[row - 2] && gameState.board[row - 2][col]?.emoji === emoji) {
        return true;
    }
    return false;
}

// 创建瓦片元素
function createTileElement(row, col, data) {
    const tile = document.createElement('div');
    tile.className = 'tile';

    // 如果传入的是对象
    if (typeof data === 'object' && data !== null) {
        tile.textContent = data.emoji;
        if (data.powerup) {
            tile.classList.add(data.powerup);
            if (data.powerup === CONFIG.powerups.rainbow) {
                tile.textContent = CONFIG.rainbowEmoji;
            }
        }
    } else {
        tile.textContent = data;
    }

    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.addEventListener('click', handleTileClick);
    elements.gameBoard.appendChild(tile);
}

// 处理点击
function handleTileClick(e) {
    if (gameState.isAnimating) return;

    const tile = e.target;
    const row = parseInt(tile.dataset.row);
    const col = parseInt(tile.dataset.col);

    if (!gameState.selectedTile) {
        // 第一次点击
        gameState.selectedTile = { row, col, element: tile };
        tile.classList.add('selected');
    } else {
        const firstTile = gameState.selectedTile;

        // 如果点击同一个瓦片，取消选择
        if (firstTile.row === row && firstTile.col === col) {
            firstTile.element.classList.remove('selected');
            gameState.selectedTile = null;
            return;
        }

        // 检查是否是相邻的瓦片
        const isAdjacent = Math.abs(firstTile.row - row) + Math.abs(firstTile.col - col) === 1;

        if (isAdjacent) {
            // 尝试交换
            firstTile.element.classList.remove('selected');
            swapTiles(firstTile.row, firstTile.col, row, col);
            gameState.selectedTile = null;
        } else {
            // 选择新的瓦片
            firstTile.element.classList.remove('selected');
            gameState.selectedTile = { row, col, element: tile };
            tile.classList.add('selected');
        }
    }
}

// 交换瓦片
async function swapTiles(row1, col1, row2, col2) {
    gameState.isAnimating = true;
    gameState.combo = 0; // 重置连击

    // 交换数据
    const temp = gameState.board[row1][col1];
    gameState.board[row1][col1] = gameState.board[row2][col2];
    gameState.board[row2][col2] = temp;

    // 更新显示
    updateTileDisplay(row1, col1);
    updateTileDisplay(row2, col2);

    // 检查彩虹球交换
    const tile1 = gameState.board[row1][col1];
    const tile2 = gameState.board[row2][col2];

    let rainbowMatch = false;
    let rainbowPos = null;
    let targetEmoji = null;

    // 检查是否有彩虹球
    if (tile1.powerup === CONFIG.powerups.rainbow) {
        rainbowMatch = true;
        rainbowPos = { row: row1, col: col1 };
        targetEmoji = tile2.emoji;
    } else if (tile2.powerup === CONFIG.powerups.rainbow) {
        rainbowMatch = true;
        rainbowPos = { row: row2, col: col2 };
        targetEmoji = tile1.emoji;
    }

    // 检查是否有匹配或彩虹球交换
    let matches = findMatches();
    const hasRainbowSwap = rainbowMatch && targetEmoji;

    if (matches.length > 0 || hasRainbowSwap) {
        gameState.moves--;
        updateUI();

        if (hasRainbowSwap) {
            // 彩虹球与任意元素交换 - 消除所有目标元素
            await processRainbowSwap(rainbowPos, targetEmoji);
        } else {
            await processMatches(matches);
        }
    } else {
        // 交换回去
        const tempBack = gameState.board[row1][col1];
        gameState.board[row1][col1] = gameState.board[row2][col2];
        gameState.board[row2][col2] = tempBack;

        updateTileDisplay(row1, col1);
        updateTileDisplay(row2, col2);

        // 抖动动画表示无效
        const tiles = document.querySelectorAll('.tile');
        const tileEl1 = tiles[row1 * CONFIG.gridSize + col1];
        const tileEl2 = tiles[row2 * CONFIG.gridSize + col2];

        tileEl1.classList.add('shake');
        tileEl2.classList.add('shake');
        setTimeout(() => {
            tileEl1.classList.remove('shake');
            tileEl2.classList.remove('shake');
        }, 300);
    }

    gameState.isAnimating = false;

    // 检查游戏结束条件
    checkGameEnd();
}

// 更新瓦片显示
function updateTileDisplay(row, col) {
    const tiles = document.querySelectorAll('.tile');
    const tile = tiles[row * CONFIG.gridSize + col];
    const data = gameState.board[row][col];

    tile.textContent = data.emoji;
    tile.className = 'tile'; // 清除所有特殊类

    if (data.powerup) {
        tile.classList.add(data.powerup);
        if (data.powerup === CONFIG.powerups.rainbow) {
            tile.textContent = CONFIG.rainbowEmoji;
        }
    }
}

// 查找匹配
function findMatches() {
    const matches = [];
    const visited = new Set();

    // 检查水平匹配
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize - 2; col++) {
            const emoji = gameState.board[row][col]?.emoji;
            if (!emoji) continue;

            let matchLength = 1;
            while (col + matchLength < CONFIG.gridSize &&
                   gameState.board[row][col + matchLength]?.emoji === emoji) {
                matchLength++;
            }

            if (matchLength >= 3) {
                const match = { type: 'horizontal', row, col, length: matchLength, emoji };
                matches.push(match);
                // 标记这些位置已处理
                for (let i = 0; i < matchLength; i++) {
                    visited.add(`${row},${col + i}`);
                }
                col += matchLength - 1; // 跳过已匹配的部分
            }
        }
    }

    // 检查垂直匹配
    for (let col = 0; col < CONFIG.gridSize; col++) {
        for (let row = 0; row < CONFIG.gridSize - 2; row++) {
            const emoji = gameState.board[row][col]?.emoji;
            if (!emoji) continue;

            let matchLength = 1;
            while (row + matchLength < CONFIG.gridSize &&
                   gameState.board[row + matchLength][col]?.emoji === emoji) {
                matchLength++;
            }

            if (matchLength >= 3) {
                const match = { type: 'vertical', row, col, length: matchLength, emoji };
                // 检查是否与水平匹配重叠（L型或T型）
                let isLOrT = false;
                for (let i = 0; i < matchLength; i++) {
                    if (visited.has(`${row + i},${col}`)) {
                        isLOrT = true;
                        break;
                    }
                }

                if (isLOrT) {
                    match.isLOrT = true;
                }

                matches.push(match);
                for (let i = 0; i < matchLength; i++) {
                    visited.add(`${row + i},${col}`);
                }
                row += matchLength - 1;
            }
        }
    }

    return matches;
}

// 处理彩虹球交换
async function processRainbowSwap(rainbowPos, targetEmoji) {
    // 收集所有目标元素的位置
    const toEliminate = new Set();
    toEliminate.add(`${rainbowPos.row},${rainbowPos.col}`);

    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            if (gameState.board[row][col]?.emoji === targetEmoji) {
                toEliminate.add(`${row},${col}`);
            }
        }
    }

    const positions = Array.from(toEliminate).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col };
    });

    // 收集目标
    collectTargets(targetEmoji, positions.length);

    // 消除
    await eliminateTiles(positions);

    // 下落并填充
    await dropTiles();
    await fillBoard();

    // 检查连击
    gameState.combo++;
    const newMatches = findMatches();
    if (newMatches.length > 0) {
        await delay(200);
        await processMatches(newMatches);
    }
}

// 处理匹配
async function processMatches(matches) {
    // 检测特殊匹配并生成道具
    const powerupsToCreate = findSpecialMatches(matches);

    // 收集所有要消除的位置
    const toEliminate = new Set();

    matches.forEach(match => {
        const { row, col, length, type } = match;

        if (type === 'horizontal') {
            for (let i = 0; i < length; i++) {
                toEliminate.add(`${row},${col + i}`);
            }
        } else {
            for (let i = 0; i < length; i++) {
                toEliminate.add(`${row + i},${col}`);
            }
        }
    });

    const positions = Array.from(toEliminate).map(pos => {
        const [row, col] = pos.split(',').map(Number);
        return { row, col };
    });

    // 收集目标元素
    positions.forEach(pos => {
        const data = gameState.board[pos.row][pos.col];
        if (data && data.emoji) {
            collectTargets(data.emoji, 1);
        }
    });

    // 创建道具
    powerupsToCreate.forEach(pu => {
        const idx = Math.floor(Math.random() * positions.length);
        const pos = positions[idx];
        if (pos && !gameState.board[pos.row][pos.col]?.powerup) {
            gameState.board[pos.row][pos.col].powerup = pu.type;
        }
    });

    // 计算分数（包含连击加成）
    const basePoints = positions.length * 10 + (positions.length > 3 ? (positions.length - 3) * 20 : 0);
    const multiplier = getComboMultiplier();
    const points = Math.floor(basePoints * multiplier);
    gameState.score += points;

    // 显示连击
    if (gameState.combo > 0) {
        showComboPopup(gameState.combo + 1);
    }
    gameState.combo++;

    // 显示分数弹出
    showScorePopup(points);

    // 消除瓦片
    await eliminateTiles(positions);

    // 下落并填充
    await dropTiles();
    await fillBoard();

    // 检查新的匹配（连击）
    const newMatches = findMatches();
    if (newMatches.length > 0) {
        await delay(200);
        await processMatches(newMatches);
    }
}

// 检测特殊匹配
function findSpecialMatches(matches) {
    const powerups = [];

    matches.forEach(match => {
        const { length, type, isLOrT, row, col } = match;

        // 5连直线 - 彩虹球
        if (length >= 5) {
            powerups.push({ type: CONFIG.powerups.rainbow, row, col });
        }
        // 4连直线 - 条纹
        else if (length === 4) {
            const stripeType = type === 'horizontal' ? CONFIG.powerups.stripeH : CONFIG.powerups.stripeV;
            powerups.push({ type: stripeType, row, col });
        }
        // L型或T型 - 炸弹
        else if (isLOrT) {
            powerups.push({ type: CONFIG.powerups.bomb, row, col });
        }
    });

    return powerups;
}

// 获取连击加成
function getComboMultiplier() {
    if (gameState.combo >= 3) return CONFIG.comboMultipliers[3];
    if (gameState.combo >= 2) return CONFIG.comboMultipliers[2];
    if (gameState.combo >= 1) return CONFIG.comboMultipliers[1];
    return 1;
}

// 收集目标
function collectTargets(emoji, count) {
    gameState.targets.forEach(target => {
        if (target.emoji === emoji) {
            target.collected = Math.min(target.collected + count, target.goal);
        }
    });
    updateTargetDisplay();
}

// 消除瓦片（包含道具效果）
async function eliminateTiles(positions) {
    const tiles = document.querySelectorAll('.tile');
    const additionalEliminate = new Set();

    // 先处理道具效果
    for (const pos of positions) {
        const data = gameState.board[pos.row][pos.col];
        if (!data) continue;

        // 条纹效果
        if (data.powerup === CONFIG.powerups.stripeH) {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                additionalEliminate.add(`${pos.row},${col}`);
            }
            showStripeEffect(pos.row, 'horizontal');
        } else if (data.powerup === CONFIG.powerups.stripeV) {
            for (let row = 0; row < CONFIG.gridSize; row++) {
                additionalEliminate.add(`${row},${pos.col}`);
            }
            showStripeEffect(pos.col, 'vertical');
        }
        // 炸弹效果
        else if (data.powerup === CONFIG.powerups.bomb) {
            for (let r = pos.row - 1; r <= pos.row + 1; r++) {
                for (let c = pos.col - 1; c <= pos.col + 1; c++) {
                    if (r >= 0 && r < CONFIG.gridSize && c >= 0 && c < CONFIG.gridSize) {
                        additionalEliminate.add(`${r},${c}`);
                    }
                }
            }
            showBombEffect(pos.row, pos.col);
        }
    }

    // 添加额外消除的位置
    additionalEliminate.forEach(pos => {
        const [row, col] = pos.split(',').map(Number);
        if (!positions.some(p => p.row === row && p.col === col)) {
            positions.push({ row, col });
        }
    });

    // 收集额外目标
    positions.forEach(pos => {
        const data = gameState.board[pos.row][pos.col];
        if (data && data.emoji) {
            collectTargets(data.emoji, 1);
        }
    });

    // 标记并消除
    const uniquePositions = [];
    const seen = new Set();
    positions.forEach(pos => {
        const key = `${pos.row},${pos.col}`;
        if (!seen.has(key)) {
            seen.add(key);
            uniquePositions.push(pos);
        }
    });

    uniquePositions.forEach(pos => {
        const tile = tiles[pos.row * CONFIG.gridSize + pos.col];
        if (tile) {
            tile.classList.add('eliminating');
        }
        // 收集目标
        const data = gameState.board[pos.row][pos.col];
        if (data && data.emoji) {
            collectTargets(data.emoji, 1);
        }
        gameState.board[pos.row][pos.col] = null;
    });

    // 显示粒子效果
    uniquePositions.forEach(pos => {
        showParticles(pos.row, pos.col);
    });

    await delay(400);

    // 移除消除的瓦片
    uniquePositions.forEach(pos => {
        const tile = tiles[pos.row * CONFIG.gridSize + pos.col];
        if (tile) {
            tile.classList.remove('eliminating');
            tile.textContent = '';
            tile.className = 'tile';
        }
    });

    updateUI();
}

// 显示条纹效果
function showStripeEffect(index, direction) {
    const tiles = document.querySelectorAll('.tile');

    for (let i = 0; i < CONFIG.gridSize; i++) {
        const pos = direction === 'horizontal' ? index * CONFIG.gridSize + i : i * CONFIG.gridSize + index;
        const tile = tiles[pos];
        if (tile) {
            tile.classList.add('stripe-active');
            setTimeout(() => tile.classList.remove('stripe-active'), 300);
        }
    }
}

// 显示炸弹效果
function showBombEffect(row, col) {
    const tiles = document.querySelectorAll('.tile');
    const tile = tiles[row * CONFIG.gridSize + col];
    if (tile) {
        tile.classList.add('bomb-active');
        setTimeout(() => tile.classList.remove('bomb-active'), 400);
    }
}

// 显示粒子效果
function showParticles(row, col) {
    const tiles = document.querySelectorAll('.tile');
    const tile = tiles[row * CONFIG.gridSize + col];
    if (!tile) return;

    const rect = tile.getBoundingClientRect();
    const boardRect = elements.gameBoard.getBoundingClientRect();

    for (let i = 0; i < 6; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = (rect.left - boardRect.left + rect.width / 2) + 'px';
        particle.style.top = (rect.top - boardRect.top + rect.height / 2) + 'px';
        particle.style.setProperty('--angle', (i * 60) + 'deg');

        elements.gameBoard.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

// 下落动画
async function dropTiles() {
    const tiles = document.querySelectorAll('.tile');

    for (let col = 0; col < CONFIG.gridSize; col++) {
        let emptyRow = CONFIG.gridSize - 1;

        for (let row = CONFIG.gridSize - 1; row >= 0; row--) {
            if (gameState.board[row][col] !== null) {
                if (row !== emptyRow) {
                    gameState.board[emptyRow][col] = gameState.board[row][col];
                    gameState.board[row][col] = null;

                    updateTileDisplay(emptyRow, col);
                    const tile = tiles[emptyRow * CONFIG.gridSize + col];
                    tile.classList.add('dropping');
                    setTimeout(() => tile.classList.remove('dropping'), 300);

                    const fromTile = tiles[row * CONFIG.gridSize + col];
                    fromTile.textContent = '';
                    fromTile.className = 'tile';
                }
                emptyRow--;
            }
        }
    }

    await delay(300);
}

// 填充空白
async function fillBoard() {
    const tiles = document.querySelectorAll('.tile');

    for (let col = 0; col < CONFIG.gridSize; col++) {
        for (let row = 0; row < CONFIG.gridSize; row++) {
            if (gameState.board[row][col] === null) {
                const emoji = CONFIG.emojis[Math.floor(Math.random() * CONFIG.emojis.length)];
                gameState.board[row][col] = { emoji, powerup: null };

                const tile = tiles[row * CONFIG.gridSize + col];
                tile.textContent = emoji;
                tile.className = 'tile dropping';
                setTimeout(() => tile.classList.remove('dropping'), 300);
            }
        }
    }

    // 消除初始匹配
    const matches = findMatches();
    if (matches.length > 0) {
        await delay(200);
        await processMatches(matches);
    }

    await delay(300);
}

// 显示分数弹出
function showScorePopup(points) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${points}`;
    popup.style.left = '50%';
    popup.style.top = '50%';
    popup.style.transform = 'translate(-50%, -50%)';

    elements.gameBoard.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

// 显示连击弹出
function showComboPopup(combo) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.textContent = `COMBO x${combo}`;

    elements.gameBoard.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
}

// 延迟函数
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 更新UI
function updateUI() {
    elements.scoreDisplay.textContent = gameState.score;
    elements.movesDisplay.textContent = gameState.moves;
    elements.levelDisplay.textContent = gameState.level;
    updateTargetDisplay();
}

// 更新目标显示
function updateTargetDisplay() {
    // 更新目标显示区域
    let targetHtml = '';
    gameState.targets.forEach(target => {
        const progress = (target.collected / target.goal) * 100;
        const completed = target.collected >= target.goal;
        targetHtml += `
            <div class="target-item ${completed ? 'completed' : ''}">
                <span class="target-emoji">${target.emoji}</span>
                <span class="target-count">${target.collected}/${target.goal}</span>
                <div class="target-progress-bar">
                    <div class="target-progress-fill" style="width: ${progress}%"></div>
                </div>
            </div>
        `;
    });

    // 如果目标显示元素不存在，创建一个
    let targetContainer = document.getElementById('target-container');
    if (!targetContainer) {
        // 创建目标显示区域
        const gameInfo = document.querySelector('.game-info');
        targetContainer = document.createElement('div');
        targetContainer.id = 'target-container';
        targetContainer.className = 'targets-container';
        gameInfo.innerHTML = '';
        gameInfo.appendChild(targetContainer);
    }
    targetContainer.innerHTML = targetHtml;
}

// 检查游戏结束
function checkGameEnd() {
    // 检查是否过关（所有目标都完成）
    const allTargetsComplete = gameState.targets.every(t => t.collected >= t.goal);

    if (allTargetsComplete) {
        setTimeout(() => {
            showLevelComplete();
        }, 500);
        return;
    }

    // 检查是否失败
    if (gameState.moves <= 0) {
        setTimeout(() => {
            showGameOver();
        }, 500);
    }
}

// 显示过关界面
function showLevelComplete() {
    const messageIndex = Math.min(gameState.level - 1, CONFIG.messages.length - 1);
    elements.levelMessage.textContent = CONFIG.messages[messageIndex];
    showScreen('levelComplete');
}

// 显示游戏结束
function showGameOver() {
    showScreen('gameOver');
}

// 下一关
function nextLevel() {
    if (gameState.level >= CONFIG.levelConfigs.length) {
        showEnding();
        return;
    }

    gameState.level++;
    const config = CONFIG.levelConfigs[gameState.level - 1];
    gameState.moves = config.moves;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.targets = JSON.parse(JSON.stringify(config.targets));
    gameState.hintUsed = false;

    updateUI();
    generateBoard();
    showScreen('game');

    // 显示本关提示
    setTimeout(() => {
        showLevelHint(config.hint);
    }, 500);
}

// 显示通关结局
function showEnding() {
    showScreen('ending');
}

// 重新开始
function restartGame() {
    startGame();
}

// 重置关卡
function resetLevel() {
    const config = CONFIG.levelConfigs[gameState.level - 1];
    gameState.score = 0;
    gameState.moves = config.moves;
    gameState.combo = 0;
    gameState.targets = JSON.parse(JSON.stringify(config.targets));
    gameState.hintUsed = false;

    updateUI();
    generateBoard();
    showScreen('game');
}

// 提示功能
function showHint() {
    if (gameState.hintUsed) return; // 每关只能使用一次提示

    // 查找可消除的配对
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            // 检查向右交换
            if (col < CONFIG.gridSize - 1) {
                swap(row, col, row, col + 1);
                if (findMatches().length > 0) {
                    swap(row, col, row, col + 1);
                    highlightTile(row, col);
                    highlightTile(row, col + 1);
                    gameState.hintUsed = true;
                    return;
                }
                swap(row, col, row, col + 1);
            }
            // 检查向下交换
            if (row < CONFIG.gridSize - 1) {
                swap(row, col, row + 1, col);
                if (findMatches().length > 0) {
                    swap(row, col, row + 1, col);
                    highlightTile(row, col);
                    highlightTile(row + 1, col);
                    gameState.hintUsed = true;
                    return;
                }
                swap(row, col, row + 1, col);
            }
        }
    }

    // 如果没有可消除的，打乱面板
    shuffleBoard();
}

// 临时交换（不更新UI）
function swap(r1, c1, r2, c2) {
    const temp = gameState.board[r1][c1];
    gameState.board[r1][c1] = gameState.board[r2][c2];
    gameState.board[r2][c2] = temp;
}

// 高亮提示瓦片
function highlightTile(row, col) {
    const tiles = document.querySelectorAll('.tile');
    const tile = tiles[row * CONFIG.gridSize + col];
    tile.classList.add('hint-highlight');
    setTimeout(() => tile.classList.remove('hint-highlight'), 1500);
}

// 打乱面板
function shuffleBoard() {
    // 收集所有emoji
    const emojis = [];
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            emojis.push(gameState.board[row][col].emoji);
        }
    }

    // 随机打乱
    for (let i = emojis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [emojis[i], emojis[j]] = [emojis[j], emojis[i]];
    }

    // 重新填充
    let idx = 0;
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            gameState.board[row][col] = { emoji: emojis[idx++], powerup: null };
            updateTileDisplay(row, col);
        }
    }

    // 添加动画效果
    const tiles = document.querySelectorAll('.tile');
    tiles.forEach(tile => {
        tile.classList.add('shuffling');
        setTimeout(() => tile.classList.remove('shuffling'), 300);
    });

    gameState.hintUsed = true;
}

// 触摸事件处理 - 拖动交换
let touchStartX = 0;
let touchStartY = 0;
let touchStartTile = null;
let touchStartRow = null;
let touchStartCol = null;

// 初始化触摸事件
function initTouchEvents() {
    const boardElement = elements.gameBoard;
    boardElement.addEventListener('touchstart', handleTouchStart, { passive: false });
    boardElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    boardElement.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// 处理触摸开始
function handleTouchStart(e) {
    if (gameState.isAnimating) return;

    // 阻止默认行为
    e.preventDefault();

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;

    // 获取触摸位置的瓦片
    const target = document.elementFromPoint(touchStartX, touchStartY);
    if (target && target.classList.contains('tile')) {
        touchStartTile = target;
        touchStartRow = parseInt(target.dataset.row);
        touchStartCol = parseInt(target.dataset.col);

        // 选中该瓦片（模拟点击选中效果）
        if (gameState.selectedTile) {
            gameState.selectedTile.element.classList.remove('selected');
        }
        gameState.selectedTile = { row: touchStartRow, col: touchStartCol, element: target };
        target.classList.add('selected');
    }
}

// 处理触摸移动
function handleTouchMove(e) {
    if (!touchStartTile) return;

    // 阻止默认滚动行为
    e.preventDefault();
}

// 处理触摸结束
function handleTouchEnd(e) {
    if (!touchStartTile || touchStartRow === null || touchStartCol === null) {
        clearTouchState();
        return;
    }

    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;

    // 计算拖动方向
    const direction = getSwipeDirection(touchStartX, touchStartY, endX, endY);

    if (direction) {
        // 根据方向确定目标瓦片位置
        let targetRow = touchStartRow;
        let targetCol = touchStartCol;

        switch (direction) {
            case 'up':
                targetRow = touchStartRow - 1;
                break;
            case 'down':
                targetRow = touchStartRow + 1;
                break;
            case 'left':
                targetCol = touchStartCol - 1;
                break;
            case 'right':
                targetCol = touchStartCol + 1;
                break;
        }

        // 检查是否在有效范围内
        if (targetRow >= 0 && targetRow < CONFIG.gridSize &&
            targetCol >= 0 && targetCol < CONFIG.gridSize) {
            // 取消选中状态
            if (gameState.selectedTile) {
                gameState.selectedTile.element.classList.remove('selected');
                gameState.selectedTile = null;
            }

            // 执行交换
            swapTiles(touchStartRow, touchStartCol, targetRow, targetCol);
        }
    }

    clearTouchState();
}

// 获取滑动方向
function getSwipeDirection(startX, startY, endX, endY) {
    const dx = endX - startX;
    const dy = endY - startY;
    const minSwipe = 30; // 最小拖动距离

    if (Math.abs(dx) > Math.abs(dy)) {
        // 水平拖动
        if (Math.abs(dx) > minSwipe) {
            return dx > 0 ? 'right' : 'left';
        }
    } else {
        // 垂直拖动
        if (Math.abs(dy) > minSwipe) {
            return dy > 0 ? 'down' : 'up';
        }
    }
    return null;
}

// 清除触摸状态
function clearTouchState() {
    touchStartX = 0;
    touchStartY = 0;
    touchStartTile = null;
    touchStartRow = null;
    touchStartCol = null;
}

// 事件监听
document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-level-btn').addEventListener('click', nextLevel);
document.getElementById('retry-btn').addEventListener('click', resetLevel);
document.getElementById('replay-btn').addEventListener('click', restartGame);
document.getElementById('restart-btn').addEventListener('click', resetLevel);
document.getElementById('hint-btn').addEventListener('click', showHint);

// 初始化触摸事件
initTouchEvents();

// 启动游戏
init();
