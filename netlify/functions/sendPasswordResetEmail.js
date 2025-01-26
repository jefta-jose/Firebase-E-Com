import { db } from "../firebase.js";
import { collection, doc, setDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

exports.handler = async (event) => {
  const { email } = JSON.parse(event.body);

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email is required." }),
    };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = Date.now() + 3600000; // 1 hour expiration time

  try {
    // Store token in Firestore
    const tokensCollection = collection(db, "passwordResetTokens");
    await setDoc(doc(tokensCollection, token), {
      email: email,
      createdAt: Date.now(),
      expiresAt: expiresAt,
    });

    // Create password reset link
    const resetLink = `${process.env.URL}/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `${token}`,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Password reset email sent!" }),
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send password reset email." }),
    };
  }
};
