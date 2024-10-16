import fetch from "node-fetch";

export default async (req, res) => {
  const query = req.query.q;
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  res.json(data);
};
