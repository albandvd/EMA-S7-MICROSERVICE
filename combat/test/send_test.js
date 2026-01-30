import amqp from 'amqplib';

const connection = await amqp.connect('amqp://localhost');
const channel = await connection.createChannel();

const msg = {
    hero: { id: "hero_123", hp: 100, atk: 20, res: 5, vit: 15 },
    monster: { name: "Gobelin", hp: 30, atk: 10, or: 5, vit: 10 }
};

channel.sendToQueue('CombatQ', Buffer.from(JSON.stringify(msg)));
console.log(" [x] Message de test envoyé");

setTimeout(() => {
    connection.close();
    process.exit(0);
}, 500);