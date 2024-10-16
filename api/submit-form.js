const sgMail = require("@sendgrid/mail");
require("dotenv").config();

export default (req, res) => {
  if (req.method === "POST") {
    const bookingInfo = req.body;
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const bookingTime = new Date().toLocaleString();

    const msg = {
      to: "rzdildar2002@gmail.com",
      from: "zaiddildar2002@gmail.com",
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
        res.status(200).json({ message: "Form submitted successfully" });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Failed to send email" });
      });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};
