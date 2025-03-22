require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express(); 
if (process.env.NODE_ENV === "production") {
	app.use(express.static("build"));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "build", "index.html"));
	});
}
// This is your test secret API key.
const Razorpay = require("razorpay");
// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe = new Razorpay({
    key_id: process.env.Key_ID,
    key_secret: process.env.Key_Secret,
});

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
	res.send("Welcome to Eshop");
});

const newArray = [];
const calculateOrderAmount = (items) => {
	items.map((item) => {
		const { price, qty } = item;
		const totalItemAmount = price * qty;
		return newArray.push(totalItemAmount);
	});
	const totalCartAmount = newArray.reduce((total, curr) => total + curr, 0);
	return totalCartAmount * 100;
};



app.post("/create-payment-intent", async (req, res) => {
	const { items, shippingAddress, description } = req.body;
	console.log(shippingAddress);
	// Create a PaymentIntent with the order amount and currency
	const paymentIntent = await stripe.orders.create({
		amount: calculateOrderAmount(items),
		currency: "inr",
		automatic_payment_methods: {
			enabled: true,
		},
		description,
		receipt: `order_rcptid_${Math.floor(Math.random() * 1000)}`,
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));