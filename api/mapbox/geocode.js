import fetch from "node-fetch";

export default async (req, res) => {
  const query = req.query.q;
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  // Bounding box for Canada (west, south, east, north)
  const canadaBoundingBox = "-141.0,41.7,-52.6,83.1";

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&bbox=${canadaBoundingBox}&country=CA`
  );

  const data = await response.json();
  res.json(data);
};
