import amqp from 'amqplib';
import { v4 as uuidv4 } from 'uuid';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// L'objet que l'on pourra "mocker" dans les tests
export const CombatClient = {
    requestCombat: async (combatPayload) => {
        const connection = await amqp.connect(RABBIT_URL);
        const channel = await connection.createChannel();
        
        // Configuration RPC : queue temporaire pour la réponse
        const replyQueue = await channel.assertQueue('', { exclusive: true });
        const correlationId = uuidv4();

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                connection.close();
                reject(new Error("Combat Service Timeout"));
            }, 5000);

            channel.consume(replyQueue.queue, (msg) => {
                if (msg.properties.correlationId === correlationId) {
                    clearTimeout(timeout);
                    const result = JSON.parse(msg.content.toString());
                    setTimeout(() => connection.close(), 500);
                    resolve(result);
                }
            }, { noAck: true });

            channel.sendToQueue('CombatQ', Buffer.from(JSON.stringify(combatPayload)), {
                correlationId,
                replyTo: replyQueue.queue
            });
        });
    }
};

// L'export simple pour le reste de ton code GameService
export const requestCombat = async (payload) => {
    return await CombatClient.requestCombat(payload);
};