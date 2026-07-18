require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares essentiels
app.use(cors());
app.use(express.json());

// Route de vérification (Health check)
app.get('/api/check', (req, res) => {
    res.json({ 
        status: 'success', 
        message: 'API Gateway opérationnelle !' 
    });
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(` Gateway démarrée sur http://localhost:${PORT}`);
});