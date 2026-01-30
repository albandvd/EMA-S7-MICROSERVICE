import amqp from 'amqplib';
import { fight } from "../logic/combatLogic.js";

export const startWorker = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const queue = 'CombatQ';

        await channel.assertQueue(queue, { durable: false });
        console.log(" [*] Worker RabbitMQ prêt sur CombatQ");

        channel.consume(queue, (msg) => {
            try {
                const data = JSON.parse(msg.content.toString());
                
                // Vérification de sécurité avant d'accéder aux propriétés
                if (!data.hero || !data.monster) {
                    console.error(" [!] Message mal formé reçu :", data);
                    return channel.ack(msg); // On acquitte quand même pour ne pas bloquer la queue
                }

                console.log(` [AMQP] Combat reçu : ${data.hero.id || 'Inconnu'} vs ${data.monster.name}`);

                const result = fight(data.hero, data.monster);
                // console.log(result);
                
                if (msg.properties.replyTo) {
                    channel.sendToQueue(msg.properties.replyTo, Buffer.from(JSON.stringify(result)), {
                        correlationId: msg.properties.correlationId
                    });
                }
                
                channel.ack(msg);
            } catch (err) {
                console.error(" [!] Erreur lors du traitement du message :", err.message);
                channel.ack(msg); 
            }
        });
    } catch (err) {
        console.error("Erreur Worker RabbitMQ:", err);
    }
};