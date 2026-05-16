// グリッド初期化
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
let grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));

// テトリミノの色
const COLORS = {
    0: 'white',      // 空
    1: '#FF6B6B',    // I (赤)
    2: '#4ECDC4',    // O (青緑)
    3: '#FFE66D',    // T (黄)
    4: '#95E1D3',    // S (緑)
    5: '#F38181',    // Z (ピンク)
    6: '#AA96DA',    // J (紫)
    7: '#FCBAD3',    // L (薄ピンク)
    8: '#A8D8EA'     // おじゃまミノ (水色)
};

let selectedColor = 1; // デフォルトはI (赤)
let currentMode = 'block'; // 'block' または 'empty'

// ページ読み込み時
document.addEventListener('DOMContentLoaded', () => {
    initializeGrid();
    setupEventListeners();
});

// グリッド初期化
function initializeGrid() {
    const gridContainer = document.getElementById('grid');
    gridContainer.innerHTML = '';
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            cell.dataset.color = grid[y][x];
            
            if (grid[y][x] !== 0) {
                cell.style.backgroundColor = COLORS[grid[y][x]];
            }
            
            cell.addEventListener('click', () => toggleCell(x, y, cell));
            gridContainer.appendChild(cell);
        }
    }
}

// セルのトグル
function toggleCell(x, y, cellElement) {
    const mode = document.getElementById('modeSelect').value;
    
    if (mode === 'empty') {
        grid[y][x] = 0;
        cellElement.style.backgroundColor = 'white';
        cellElement.dataset.color = 0;
    } else {
        const color = parseInt(document.getElementById('colorSelect').value);
        grid[y][x] = color;
        cellElement.style.backgroundColor = COLORS[color];
        cellElement.dataset.color = color;
    }
}

// イベントリスナー設定
function setupEventListeners() {
    document.getElementById('clearBtn').addEventListener('click', clearGrid);
    document.getElementById('fillBtn').addEventListener('click', fillGrid);
    document.getElementById('calculateBtn').addEventListener('click', calculatePerfectClear);
    document.getElementById('loadBtn').addEventListener('click', loadFromFumen);
    document.getElementById('copyBtn').addEventListener('click', copyFumen);
    
    document.getElementById('modeSelect').addEventListener('change', (e) => {
        currentMode = e.target.value;
    });
    
    document.getElementById('colorSelect').addEventListener('change', (e) => {
        selectedColor = parseInt(e.target.value);
    });
}

// グリッドクリア
function clearGrid() {
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));
    initializeGrid();
}

// グリッド全て埋める
function fillGrid() {
    const color = parseInt(document.getElementById('colorSelect').value);
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(color));
    initializeGrid();
}

// 盤面をFumen形式に変換
function gridToFumen() {
    let fumenData = 'v115@';
    
    // 行ごとにエンコード
    for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = grid[y][x];
            if (cell === 0) {
                fumenData += '0';
            } else {
                fumenData += 'X';
            }
        }
    }
    
    return fumenData;
}

// パフェ率計算
async function calculatePerfectClear() {
    const resultsBox = document.getElementById('results');
    
    // 盤面が全て空の場合
    const isEmpty = grid.every(row => row.every(cell => cell === 0));
    if (isEmpty) {
        resultsBox.innerHTML = '<p class="placeholder">盤面に何も描かれていません</p>';
        return;
    }
    
    // ローディング表示
    resultsBox.innerHTML = '<p class="placeholder">計算中...</p>';
    
    try {
        // サーバーに計算リクエストを送信
        const fieldData = gridToFumen();
        const response = await fetch('https://tetris-perfect-clear-analyzer.onrender.com/api/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ field: fieldData })
        });
        
        if (!response.ok) {
            throw new Error('Server error');
        }
        
        const result = await response.json();
        
        // 結果を表示
        let html = `
            <div class="result-item">
                <div class="result-label">パフェ率</div>
                <div class="result-value">${result.percent.toFixed(2)}%</div>
            </div>
            <div class="result-item">
                <div class="result-label">セットアップ率</div>
                <div class="result-value">${result.setupRate.toFixed(2)}%</div>
            </div>
            <div class="result-item">
                <div class="result-label">パターン数</div>
                <div class="result-value">${result.patterns.length}</div>
            </div>
        `;
        
        resultsBox.innerHTML = html;
        
        // Fumen形式を生成
        document.getElementById('fumenOutput').value = fieldData;
        
    } catch (error) {
        console.error('Error:', error);
        resultsBox.innerHTML = '<p class="placeholder" style="color: red;">エラーが発生しました</p>';
    }
}

// Fumenから読み込む
function loadFromFumen() {
    const fumenInput = document.getElementById('fumenInput').value.trim();
    
    if (!fumenInput.startsWith('v115@')) {
        alert('正しいFumen形式ではありません（v115@で始まる必要があります）');
        return;
    }
    
    alert('Fumen読み込み機能は準備中です');
}

// Fumenをコピー
function copyFumen() {
    const fumenOutput = document.getElementById('fumenOutput');
    if (!fumenOutput.value) {
        alert('まずパフェ率を計算してください');
        return;
    }
    
    fumenOutput.select();
    document.execCommand('copy');
    alert('コピーしました！');
}
