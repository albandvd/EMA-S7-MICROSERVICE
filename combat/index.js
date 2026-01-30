import express from 'express';
import { fight } from "./combatLogic.js";
import { startWorker } from "./worker.js";

const app = express();
app.use(express.json());
const PORT = 3004;

await startWorker();

app.get('/', (req, res) => {
    res.send("Combat Service API is alive and listening to RabbitMQ");
});

app.post('/fight-manual', (req, res) => {
    const { hero, monster } = req.body;
    const result = fight(hero, monster);
    res.json(result);
});

app.listen(PORT, () => console.log(`Combat API running on port ${PORT}`));