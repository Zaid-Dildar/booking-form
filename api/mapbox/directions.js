import fetch from "node-fetch";

export default async (req, res) => {
  const { coordinates } = req.query;
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  res.json(data);
};
