import express from 'express';
import { startWorker } from './src/workers/worker.js';
import combatRoutes from './src/api/combatRoutes.js';

const app = express();
app.use(express.json());

startWorker().catch(console.error);

app.use('/', combatRoutes);

app.listen(3004, () => console.log("Combat Service Ready"));