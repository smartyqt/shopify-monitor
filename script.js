const axios = require("axios");
require("dotenv").config();
const { WebhookClient, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const webhookClient = new WebhookClient({
  url: process.env.DISCORD_WEBHOOK_URL,
});

const URL = "https://store.taylorswift.com/";

let allItems = {};

// Function to check stock
const checkStock = async () => {
  try {
    const response = await axios.get(URL + "/products.json?limit=250");
    const products = response.data.products;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      if (!allItems[product.id]) {
        allItems[product.id] = product.variants[0].available;
        sendProductUpdate(product, "New Product");
      } else if (product.variants[0].available && !allItems[product.id]) {
        allItems[product.id] = product.variants[0].available;
        sendProductUpdate(product, "In Stock");
      } else if (!product.variants[0].available && allItems[product.id]) {
        allItems[product.id] = product.variants[0].available;
        sendProductUpdate(product, "Out of Stock");
      }
    }
  } catch (err) {
    console.log(err);
  } finally {
    // Schedule the next check only after this one is complete
    setTimeout(checkStock, 15000);
  }
};

// Function to send updates to Discord
const sendProductUpdate = (productInfo, status) => {
  const embed = new EmbedBuilder()
    .setColor("#1DB954")
    .setAuthor({
      name: `${URL}`,
      iconURL:
        "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-shopping-bag-full-color-66166b2e55d67988b56b4bd28b63c271e2b9713358cb723070a92bde17ad7d63.svg",
    })
    .setTitle(productInfo.title || "Unknown Product Title")
    .setURL(`https://store.taylorswift.com/products/${productInfo.handle}`)
    .setThumbnail(
      productInfo.images[0]?.src || "https://your-fallback-image-url.com"
    )
    .addFields(
      { name: "Status", value: status, inline: false },
      {
        name: "Price",
        value: `${productInfo.variants[0]?.price || "N/A"}`,
        inline: true,
      },
      {
        name: "SKU",
        value: `${productInfo.variants[0]?.sku || "N/A"}`,
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
      username: "Captain Hook",
      avatarURL: "https://your-avatar-url.com/avatar.png",
      embeds: [embed],
    })
    .catch((error) => {
      console.error("Error sending message:", error);
    });
};

// Start the first check
checkStock();
