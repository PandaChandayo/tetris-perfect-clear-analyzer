// グリッド初期化
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
let grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));

let selectedPiece = 'block';

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
            
            if (grid[y][x] === 1) {
                cell.classList.add('filled');
            }
            
            cell.addEventListener('click', () => toggleCell(x, y, cell));
            gridContainer.appendChild(cell);
        }
    }
}

// セルのトグル
function toggleCell(x, y, cellElement) {
    const mode = document.getElementById('pieceSelect').value;
    
    if (mode === 'empty') {
        grid[y][x] = 0;
        cellElement.classList.remove('filled');
    } else {
        grid[y][x] = 1;
        cellElement.classList.add('filled');
    }
}

// イベントリスナー設定
function setupEventListeners() {
    document.getElementById('clearBtn').addEventListener('click', clearGrid);
    document.getElementById('fillBtn').addEventListener('click', fillGrid);
    document.getElementById('calculateBtn').addEventListener('click', calculatePerfectClear);
    document.getElementById('loadBtn').addEventListener('click', loadFromFumen);
    document.getElementById('copyBtn').addEventListener('click', copyFumen);
    document.getElementById('pieceSelect').addEventListener('change', (e) => {
        selectedPiece = e.target.value;
    });
}

// グリッドクリア
function clearGrid() {
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(0));
    initializeGrid();
}

// グリッド全て埋める
function fillGrid() {
    grid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(1));
    initializeGrid();
}

// パフェ率計算
function calculatePerfectClear() {
    const resultsBox = document.getElementById('results');
    
    // 盤面が全て空の場合
    const isEmpty = grid.every(row => row.every(cell => cell === 0));
    if (isEmpty) {
        resultsBox.innerHTML = '<p class="placeholder">盤面に何も描かれていません</p>';
        return;
    }
    
    // 簡易的なパフェ率計算
    const filledCount = grid.flat().filter(cell => cell === 1).length;
    const totalCells = GRID_WIDTH * GRID_HEIGHT;
    const percent = ((filledCount / totalCells) * 100).toFixed(2);
    
    // 結果を表示
    let html = `
        <div class="result-item">
            <div class="result-label">盤面の埋まり率</div>
            <div class="result-value">${percent}%</div>
        </div>
        <div class="result-item">
            <div class="result-label">埋まったセル数</div>
            <div class="result-value">${filledCount}/${totalCells}</div>
        </div>
        <div class="result-item">
            <div class="result-label">空いたセル数</div>
            <div class="result-value">${totalCells - filledCount}</div>
        </div>
    `;
    
    resultsBox.innerHTML = html;
    
    // Fumen形式を生成
    generateFumen();
}

// Fumen形式生成（簡易版）
function generateFumen() {
    // 盤面データをBase64で符号化する簡易版
    let fumenData = 'v115@';
    
    // 各行をエンコード（簡易版）
    for (let y = 0; y < GRID_HEIGHT; y++) {
        let rowData = '';
        for (let x = 0; x < GRID_WIDTH; x++) {
            rowData += grid[y][x] ? '1' : '0';
        }
        // 簡易的なエンコード
        fumenData += rowData;
    }
    
    document.getElementById('fumenOutput').value = fumenData;
}

// Fumenから読み込む
function loadFromFumen() {
    const fumenInput = document.getElementById('fumenInput').value.trim();
    
    if (!fumenInput.startsWith('v115@')) {
        alert('正しいFumen形式ではありません（v115@で始まる必要があります）');
        return;
    }
    
    // 簡易的なデコード
    alert('Fumen読み込み機能は準備中です');
    // TODO: 本格的なFumenデコード実装
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