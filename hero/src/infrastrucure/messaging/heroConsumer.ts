import amqp from 'amqplib';
import { HeroServicePort } from '../../application/ports/inbound/HeroServicePort';

const RABBIT_URL = process.env.RABBITMQ_URL || 'amqp://ema-s7-micro-rabbitmq-service';

export class HeroConsumer {
    private readonly actionMap: Record<string, (data: any) => Promise<void>>;

    constructor(private readonly heroService: HeroServicePort) {
        this.actionMap = {
            // 'CREATE_HERO': async (data) => {
            //     await this.heroService.createNewHero({ 
            //         name: data.name, 
            //         class: data.heroClass 
            //     });
            // },

            'UPDATE_HERO': async (data) => {
                await this.heroService.updateHero(data.userId, { 
                    hp: data.newHp, 
                    gold: data.newGold 
                });
            },

            // 'ADD_ITEM': async (data) => {
            //     await this.heroService.updateHero(data.userId, { 
            //         inventory: data.inventory 
            //     });
            // },

            'HERO_DIED': async (data) => {
                await this.heroService.deleteHero(data.userId);
            }
        };
    }

    async start() {
        try {
            const connection = await amqp.connect(RABBIT_URL);
            const channel = await connection.createChannel();
            const queue = 'HeroQ';

            await channel.assertQueue(queue, { durable: true });
            
            console.log(` [*] HeroConsumer démarré sur la queue: ${queue}`);

            channel.consume(queue, async (msg) => {
                if (!msg) return;
                
                const messageStr = msg.content.toString();
                const { action, data } = JSON.parse(messageStr);

                try {
                    const executeAction = this.actionMap[action];

                    if (executeAction) {
                        await executeAction(data);
                        console.log(` [AMQP] Succès: ${action} pour ${data.userId || 'nouveau héros'}`);
                    } else {
                        console.warn(` [AMQP] Action inconnue ignorée: ${action}`);
                    }

                    channel.ack(msg);
                } catch (err) {
                    console.error(` [AMQP] Erreur lors du traitement de ${action}:`, err);
                    // On ne fait pas de ack ici pour permettre une re-tentative (redelivery)
                    // Ou on peut mettre un Dead Letter Exchange (DLX)
                }
            });
        } catch (error) {
            console.error(" [AMQP] Impossible de se connecter à RabbitMQ:", error);
            // Retry après 5 secondes
            setTimeout(() => this.start(), 5000);
        }
    }
}