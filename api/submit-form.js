import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const bookingInfo = req.body;

  // Set booking time based on a specific time zone (e.g., America/Toronto for Canada)
  const bookingTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Toronto",
    hour12: true, // Optional: Set to true if you prefer 12-hour format
  });

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
      <p><strong>Basic Fee:</strong> ${bookingInfo.basicFee}</p>
      <p><strong>No of hours:</strong> ${bookingInfo.hours}</p>
      <p><strong>Gratuity:</strong> ${bookingInfo.gratuity}</p>
      <p><strong>Vip Service:</strong> ${bookingInfo.vipService}</p>
      <p><strong>Tax:</strong> ${bookingInfo.tax}</p>
      <p><strong>Total Fee:</strong> $${bookingInfo.finalPrice}</p>
      <p><strong>Payment Method:</strong> ${bookingInfo.paymentMethod}</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return res.json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to send email" });
  }
};
