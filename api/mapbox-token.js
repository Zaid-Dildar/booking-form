require("dotenv").config();

export default (req, res) => {
  if (req.method === "GET") {
    res.status(200).json({ token: process.env.MAPBOX_TOKEN });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
