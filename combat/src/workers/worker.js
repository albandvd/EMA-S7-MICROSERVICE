import amqp from 'amqplib';
import { fight } from "../logic/combatLogic.js";

export const startWorker = async () => {

    const RABBIT_URL = process.env.RABBIT_URL || 'amqp://rabbitmq';

    let connection;
    // Boucle de reconnexion
    let connected = false;
    while (!connected) {
        try {
            console.log(" [AMQP] Tentative de connexion à RabbitMQ...");
            connection = await amqp.connect(RABBIT_URL);
            
            console.log(" [AMQP] Connecté avec succès !");
            connected = true;
        } catch (err) {
            console.error(` [!] Échec de connexion : ${err.message}`);
            console.log(" [!] Nouvelle tentative dans 5s...");
            await new Promise(res => setTimeout(res, 5000)); 
        }
    }

    try {
        const channel = await connection.createChannel();
        const queue = 'CombatQ';

        await channel.assertQueue(queue, { durable: false });
        console.log(" [*] Worker RabbitMQ prêt sur CombatQ");

        channel.consume(queue, (msg) => {
            try {
                const data = JSON.parse(msg.content.toString());
                
                if (!data.hero || !data.monster) {
                    console.error(" [!] Message mal formé reçu :", data);
                    return channel.ack(msg); 
                }

                console.log(` [AMQP] Combat reçu : ${data.hero.id || 'Inconnu'} vs ${data.monster.name}`);

                const result = fight(data.hero, data.monster);
                console.log(result);
                console.log(msg.properties);
                
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