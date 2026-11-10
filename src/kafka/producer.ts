import { kafka } from "./kafka";
import { logger } from "../utils/logger";

const producer = kafka.producer();

export async function connectProducer() {
    await producer.connect();
    logger.info("Kafka Producer Connected");
}

export async function disconnectProducer(){
    await producer.disconnect();
    logger.info("Kafka Producer Disconnected");
}

export async function publishUserSignup(user: {
  id: number;
  username: string;
  email: string;
}) {
  await producer.send({
    topic: "user.signup",
    messages: [
      {
        value: JSON.stringify({
          userId: user.id,
          username: user.username,
          email: user.email,
        }),
      },
    ],
  });

  logger.info({ userId: user.id }, "User signup event published");
}

export default producer;