import { db } from "../firebase.js";
import { collection, doc, setDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  const { email } = JSON.parse(event.body);

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Valid email is required." }),
    };
  }

  const token = crypto.randomBytes(32).toString("hex");

  try {
    // Store token in Firestore with expiry
    const tokensCollection = collection(db, "verificationTokens");
    await setDoc(doc(tokensCollection, token), {
      email: email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours expiry
    });

    // Create verification link
    const verificationLink = `${process.env.URL}/.netlify/functions/verifyEmail?token=${token}`;

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Verification email sent!" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send verification email." }),
    };
  }
};
