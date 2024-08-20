const axios = require("axios");
require("dotenv").config();
const { WebhookClient, EmbedBuilder } = require("discord.js");

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
});

const URL = "https://store.taylorswift.com/";

const outOfStock = {};

const checkStock = async () => {
  try {
    const response = await axios.get(URL + "/products.json?limit=250");
    const products = response.data.products;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const imageURL = product.images[0]?.src || null; // Use null if no image

      sendProductUpdate(product, imageURL);

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

const sendProductUpdate = (productInfo, imageURL = null) => {
  const embed = new EmbedBuilder()
    .setColor("#1DB954") // Spotify's green color
    .setAuthor({
      name: `${URL}`,
      iconURL:
        "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-shopping-bag-full-color-66166b2e55d67988b56b4bd28b63c271e2b9713358cb723070a92bde17ad7d63.svg",
    })
    .setTitle(productInfo.title || "Unknown Product Title") // Fallback if title is null
    .setURL(productInfo.url || "https://store.taylorswift.com") // Fallback if URL is null
    .setThumbnail(imageURL || "https://your-fallback-image-url.com") // Fallback image if null
    .addFields(
      { name: "Status", value: "New Product", inline: false },
      {
        name: "Price",
        value: `${productInfo.variants[0]?.price || "N/A"}`, // Fallback if price is null
        inline: true,
      },
      {
        name: "SKU",
        value: `${productInfo.variants[0]?.sku || "N/A"}`, // Fallback if SKU is null
        inline: true,
      },
      {
        name: "Default Title",
        value: `${productInfo.handle || "N/A"}`,
        inline: true,
      }
    )
    .setFooter({ text: `Smarty || ${new Date().toLocaleString()} ` });

  webhookClient
    .send({
      username: "Captain Hook", // Name to display
      avatarURL: "https://your-avatar-url.com/avatar.png", // Replace with the actual URL to the avatar image
      embeds: [embed],
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

checkStock();
setInterval(checkStock, 60000); // Check stock every 60 seconds
