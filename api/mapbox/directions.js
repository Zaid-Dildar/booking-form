import fetch from "node-fetch";

export default async (req, res) => {
  const { start, end } = req.query;
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  res.json(data);
};
