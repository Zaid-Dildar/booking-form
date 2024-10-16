const express = require("express");
const path = require("path");
const fetch = require("node-fetch");
const app = express();
require("dotenv").config();

app.use(express.json()); // Add this line to parse JSON bodies

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "..", "public")));

// Route for serving the index.html file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// Handle form submissions
app.post("/submit-form", (req, res) => {
  const bookingInfo = req.body; // Ensure that you're receiving the booking info from the request body
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const bookingTime = new Date().toLocaleString(); // Get the current date and time

  const msg = {
    to: "rzdildar2002@gmail.com", // Change to your recipient
    from: "zaiddildar2002@gmail.com", // Change to your verified sender
    subject: `New Booking - ${bookingTime}`,
    html: `
        <h2>New Booking Details</h2>
        <p><strong>Booking Time:</strong> ${bookingTime}</p>
        <p><strong>Passengers:</strong> ${bookingInfo.passengers}</p>
        <p><strong>Bags:</strong> ${bookingInfo.bags}</p>
        <p><strong>First Name:</strong> ${bookingInfo.firstName}</p>
        <p><strong>Last Name:</strong> ${bookingInfo.lastName}</p>
        <p><strong>Email:</strong> ${bookingInfo.email}</p>
        <p><strong>Phone:</strong> ${bookingInfo.phone}</p>
        <p><strong>Flight Number:</strong> ${bookingInfo.flightNo}</p>
        <p><strong>Additional Information:</strong> ${bookingInfo.additionalInfo}</p>
        <p><strong>Pickup Location:</strong> ${bookingInfo.pickupLocation}</p>
        <p><strong>Dropoff Location:</strong> ${bookingInfo.dropoffLocation}</p>
        <p><strong>Pickup Date:</strong> ${bookingInfo.pickupDate}</p>
        <p><strong>Pickup Time:</strong> ${bookingInfo.pickupTime}</p>
        <p><strong>Selected Car:</strong> ${bookingInfo.selectedCar}</p>
      `,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
      res.json({ message: "Form submitted successfully" });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Failed to send email" });
    });
});

// Endpoint to get the Mapbox token
app.get("/api/mapbox-token", (req, res) => {
  res.json({ token: process.env.MAPBOX_TOKEN });
});

// Mapbox route to handle geocoding and directions requests
app.get("/mapbox/geocode", async (req, res) => {
  const query = req.query.q;
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  res.json(data);
});

// Handle directions requests
app.get("/mapbox/directions", async (req, res) => {
  const { start, end } = req.query; // start and end should be in lng,lat format
  const MAPBOX_TOKEN = process.env.MAPBOX_TOKEN;

  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
  );
  const data = await response.json();
  res.json(data);
});

// Only listen when not in Vercel's serverless environment
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
