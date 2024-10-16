const fetch = require("node-fetch");
require("dotenv").config();

export default async (req, res) => {
  if (req.method === "GET") {
    const { start, end } = req.query;
    const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch directions data" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
