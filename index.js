const { Client, GatewayIntentBits } = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  try {
    const channel = await client.channels.fetch("1269816025335988224");
    if (channel) {
      channel.send("Hello, world!");
    }
  } catch (error) {
    console.error("Error:", error);
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);
