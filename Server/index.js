import express from "express";
import nodemailer from 'nodemailer'
import bodyParser from 'body-parser'
import cors from 'cors'
import crypto from 'crypto'
import dotenv from 'dotenv'

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
dotenv.config();

// Store verification tokens
const verificationTokens = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// API to send verification email
app.post("/send-verification-email", (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).send("Email is required.");

    // Generate a verification token
    const token = crypto.randomBytes(32).toString("hex");
    verificationTokens[token] = email;

    const verificationLink = `${req.protocol}://${req.get("host")}/verify-email?token=${token}`;

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify Your Email",
        html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error sending email.");
        }
        res.send("Verification email sent!");
    });
});

// API to verify email
app.get("/verify-email", (req, res) => {
    const { token } = req.query;

    if (!token || !verificationTokens[token]) {
        return res.status(400).send("Invalid or expired token.");
    }

    const email = verificationTokens[token];
    delete verificationTokens[token];

    res.send(`Email ${email} verified successfully!`);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});