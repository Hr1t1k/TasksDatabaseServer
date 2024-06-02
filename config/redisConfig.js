import { createClient } from "redis";
const client = createClient({
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: 18077,
  },
});
client.on("error", (error) => console.error(`Error : ${error}`));
await client.connect();
export default client;
