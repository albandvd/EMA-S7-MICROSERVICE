import amqp from 'amqplib';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// 1. On définit la logique réelle dans un objet
export const HeroSender = {
    sendHeroAction: async (action, data) => {
        let connection;
        try {
            connection = await amqp.connect(RABBIT_URL);
            const channel = await connection.createChannel();
            const queue = 'HeroQ';

            await channel.assertQueue(queue, { durable: true });

            const payload = { action, data, timestamp: new Date().toISOString() };

            channel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
                persistent: true 
            });

            console.log(` [AMQP] Action '${action}' envoyée.`);

            setTimeout(async () => {
                await channel.close();
                await connection.close();
            }, 500);

        } catch (error) {
            console.error(" [AMQP] Erreur:", error.message);
        }
    }
};

// 2. On exporte aussi la fonction normalement pour ne pas casser le reste du code
// Mais attention : cette fonction appelle celle de l'OBJET au-dessus
export const sendHeroAction = async (action, data) => {
    return await HeroSender.sendHeroAction(action, data);
};