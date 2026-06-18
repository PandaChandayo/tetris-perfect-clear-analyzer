const express = require('express');
const cors = require('cors');
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
app.use(express.static('public'));

// シンプルなエコーエンドポイント（サーバーが動いているか確認用）
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// ダミーのパフェ率計算エンドポイント（WebAssemblyで計算するため、ここでは簡易版）
app.post('/api/calculate', (req, res) => {
    try {
        const { field } = req.body;

        if (!field) {
            return res.status(400).json({ error: 'Field data is required' });
        }

        // ダミーデータを返す（実際の計算はクライアント側で行う）
        res.json({
            percent: 85.5,
            setupRate: 72.3,
            patterns: [
                { name: 'Pattern 1', percent: 45.2 },
                { name: 'Pattern 2', percent: 40.3 }
            ],
            maxPerfectField: field
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            error: 'Calculation failed',
            message: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
