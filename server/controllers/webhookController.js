import Stripe from "stripe";
import Transaction from "../models/Transaction.js";
import User from "../models/User.js";

export const stripeWebhooks = async (req, res) => {
  // console.log("📨 Webhook received at /api/stripe endpoint");
  // console.log("Headers:", req.headers);
  // console.log("Body type:", typeof req.body);
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    // Construct Stripe event using raw body
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    // console.log(" Webhook received:", event.type);
    // console.log("Webhook Secret:", process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    // console.error(" Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        if (!paymentIntent) {
          // console.log(" No payment intent found");
          return res.status(400).send("No payment intent found");
        }

        // For payment_intent events, metadata is directly on the object
        const { transactionId, appId } = paymentIntent.metadata;

        if (appId !== "quickgpt") {
          // console.log(" Ignored webhook: appId mismatch");
          return res.json({ received: true, message: "Ignored event: Invalid app" });
        }

        // Find the transaction in DB
        const transaction = await Transaction.findOne({
          _id: transactionId,
          isPaid: false,
        });

        if (!transaction) {
          // console.log(" Transaction not found or already paid:", transactionId);
          return res.json({ received: true, message: "Transaction not found or already paid" });
        }

        // --- DEBUG: Log transaction details
        // console.log("Transaction found:", transaction);

        // Update user credits safely
        const updatedUser = await User.findByIdAndUpdate(
          transaction.userId,
          { $inc: { credits: transaction.credits } },
          { new: true }
        );

        if (!updatedUser) {
          console.error(" User not found:", transaction.userId);
          return res.status(400).send("User not found");
        }

        // console.log(" User credits updated:", updatedUser.credits);

        // Mark transaction as paid
        transaction.isPaid = true;
        await transaction.save();
        // console.log("Transaction marked as paid");

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
        break;
    }

    // Respond to Stripe to acknowledge receipt
    res.json({ received: true });
  } catch (error) {
    console.error(" Webhook processing error:", error);
    res.status(500).send("Internal Server Error");
  }
};
