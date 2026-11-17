import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "mini-project",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
});