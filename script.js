const axios = require("axios");
require("dotenv").config();
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
let targetChannel;

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  targetChannel = await client.channels.fetch("1269816025335988224");
  checkStock();
  setInterval(checkStock, 60000);
});

const URL = "https://store.taylorswift.com/";

const outOfStock = {};

const checkStock = async () => {
  try {
    const response = await axios.get(URL + "/products.json?limit=250");
    const products = response.data.products;
    sendMessageToChannel("Checking stock...");
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      sendMessageToChannel(
        "Checking stock for " + product.title,
        product.images[0]?.src
      );
      if (!(product.title in outOfStock)) {
        continue;
      }
      if (product.variants[0].available === false) {
        outOfStock[product.title] = product.available;
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const sendMessageToChannel = (message, imageURL) => {
  if (targetChannel) {
    const embed = new EmbedBuilder()
      .setTitle("Taylor Swift Store")
      .setDescription(message)
      .setColor("#FF69B4");

    if (imageURL) {
      embed.setImage(imageURL);
    }

    targetChannel.send({ embeds: [embed] }).catch((error) => {
      console.error("Error sending message:", error);
    });
  } else {
    console.error("Target channel is not defined");
  }
};

client.login(process.env.DISCORD_BOT_TOKEN);
