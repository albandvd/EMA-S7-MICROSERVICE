import express from 'express';
import gameRoutes from './src/api/gameRoutes.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

app.use('/', gameRoutes);

app.listen(PORT, () => {
    console.log(`[GameService] Orchestrator running on port ${PORT}`);
});