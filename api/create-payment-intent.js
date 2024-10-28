const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { amount } = req.body;

      // Create a PaymentIntent with the specified amount
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // specify amount in cents, e.g., 1000 for $10
        currency: "usd",
        automatic_payment_methods: { enabled: true },
      });

      // Send the client_secret back to the client
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create Payment Intent" });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
};
