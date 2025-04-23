"use strict";

const bcrypt = require("bcrypt");
const fetch = require("node-fetch");

const likes = new Map();
const salt = bcrypt.genSaltSync(10);

const fetchStockData = async (stock) => {
  const res = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
  if (!res.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await res.json();
  return { stock, price: data.latestPrice, likes: likes.get(stock)?.size ?? 0 };
};

module.exports = function (app) {
  app.route("/api/stock-prices").get(async function (req, res) {
    const { stock, like } = req.query;
    if (!stock) {
      return res.status(400).json({ error: "No stock provided" });
    }

    const stockArray = Array.isArray(stock) ? stock : [stock];
    if (stockArray.length > 2) {
      return res.status(400).json({ error: "Too many stocks" });
    }

    if (like) {
      stockArray.forEach((s) => {
        if (!likes.has(s)) likes.set(s, new Set());
        likes.get(s).add(bcrypt.hashSync(req.ip, salt));
      });
    }

    const data = await Promise.all(stockArray.map(fetchStockData));

    if (data.length === 0) {
      return res.status(400).json({ error: "No stock data found" });
    } else if (data.length === 1) {
      return res.json({ stockData: data[0] });
    } else if (data.length === 2) {
      const stockData = [
        {
          stock: data[0].stock,
          price: data[0].price,
          rel_likes: data[0].likes - data[1].likes,
        },
        {
          stock: data[1].stock,
          price: data[1].price,
          rel_likes: data[1].likes - data[0].likes,
        },
      ];
      return res.json({ stockData });
    } else {
      return res.status(400).json({ error: "Too many stocks" });
    }
  });
};
