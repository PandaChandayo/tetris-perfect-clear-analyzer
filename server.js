const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // 静的ファイルを提供

// ルートエンドポイント
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// パフェ率計算エンドポイント
app.post('/api/calculate', async (req, res) => {
    try {
        const { field } = req.body;
        
        if (!field) {
            return res.status(400).json({ error: 'Field data is required' });
        }

        // 盤面データをファイルに一時保存
        const fieldFilePath = path.join(__dirname, 'temp_field.txt');
        fs.writeFileSync(fieldFilePath, field);

        // Solution Finderコマンドを実行
        // 注意：Solution Finderをインストールする必要があります
        const command = `java -jar solution-finder.jar percent -f ${fieldFilePath}`;

        exec(command, (error, stdout, stderr) => {
            // 一時ファイルを削除
            if (fs.existsSync(fieldFilePath)) {
                fs.unlinkSync(fieldFilePath);
            }

            if (error) {
                console.error('Error:', error);
                return res.status(500).json({ 
                    error: 'Calculation failed',
                    details: stderr 
                });
            }

            // 結果を解析
            const result = parseResult(stdout);
            res.json(result);
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// 結果解析関数
function parseResult(output) {
    // Solution Finderの出力を解析
    // 詳細な解析ロジックはSolution Finderの出力形式に応じて調整
    
    const lines = output.split('\n');
    const result = {
        percent: 0,
        patterns: [],
        setupRate: 0
    };

    lines.forEach(line => {
        if (line.includes('Percent')) {
            const match = line.match(/Percent\s*:\s*([\d.]+)%/);
            if (match) result.percent = parseFloat(match[1]);
        }
        if (line.includes('Setup')) {
            const match = line.match(/Setup\s*:\s*([\d.]+)%/);
            if (match) result.setupRate = parseFloat(match[1]);
        }
    });

    return result;
}

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access: http://localhost:${PORT}`);
});
