const express = require('express');
const cors = require('cors');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 設定
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// パフェ率計算エンドポイント
app.post('/api/calculate', (req, res) => {
    try {
        const { field } = req.body;

        if (!field) {
            return res.status(400).json({ error: 'Field data is required' });
        }

        // 入力ファイルを作成
        const inputDir = '/app/input';
        if (!fs.existsSync(inputDir)) {
            fs.mkdirSync(inputDir, { recursive: true });
        }

        const inputFile = path.join(inputDir, 'field.txt');
        fs.writeFileSync(inputFile, field);

        // Solution Finder を実行
        const command = `cd /app && java -jar sfinder.jar percent -f ${inputFile}`;
        const output = execSync(command, { encoding: 'utf-8' });

        // 結果をパース
        const result = parseOutput(output);

        res.json({
            percent: result.percent,
            setupRate: result.setupRate,
            patterns: result.patterns,
            maxPerfectField: result.maxPerfectField
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Calculation failed',
            message: error.message 
        });
    }
});

// 結果をパース（Solution Finder の出力から抽出）
function parseOutput(output) {
    // 簡易パース（Solution Finder の出力形式に合わせて）
    const lines = output.split('\n');
    let percent = 0;
    let setupRate = 0;
    let patterns = [];
    let maxPerfectField = '';

    for (const line of lines) {
        if (line.includes('%')) {
            const match = line.match(/(\d+\.?\d*)\s*%/);
            if (match) {
                percent = parseFloat(match[1]);
            }
        }
        if (line.includes('setup')) {
            const match = line.match(/(\d+\.?\d*)\s*%/);
            if (match) {
                setupRate = parseFloat(match[1]);
            }
        }
        if (line.includes('http')) {
            patterns.push(line.trim());
            maxPerfectField = line.trim();
        }
    }

    return { percent, setupRate, patterns, maxPerfectField };
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
