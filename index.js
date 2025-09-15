
require('dotenv').config();
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); // Replace with your Stripe secret key
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
    const { items, paymentMethod } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'No items provided' });
    }

    const lineItems = items.map(item => ({
        price_data: {
            currency: 'usd',
            product_data: {
                name: item.title,
            },
            unit_amount: Math.round(item.price * 100), // Convert price to cents
        },
        quantity: item.quantity,
    }));

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: paymentMethod === 'bank_account' ? ['us_bank_account'] : ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'http://localhost:5173/success',
            cancel_url: 'http://localhost:5173/cancel',
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error); // Log the error details
        res.status(500).json({ error: error.message });
    }
});


app.listen(4242, () => console.log('Server running on port 4242'));
