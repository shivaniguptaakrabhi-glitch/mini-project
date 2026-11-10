import { Kafka } from "kafkajs";

export const kafka = new Kafka({
  clientId: "mini-project",
  brokers: ["kafka:9092"],
});