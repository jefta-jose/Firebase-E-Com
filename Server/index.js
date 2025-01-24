import express from "express";
import nodemailer from 'nodemailer'
import bodyParser from 'body-parser'
import cors from 'cors'
import crypto from 'crypto'
import dotenv from 'dotenv'
import { db } from "./firebase.js";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";


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

    updateVerificationStatus(email)
});

// API to verify email
app.get("/verify-email", async (req, res) => {
    const { token } = req.query;

    if (!token || !verificationTokens[token]) {
        return res.status(400).send("Invalid or expired token.");
    }

    const email = verificationTokens[token];
    delete verificationTokens[token];

    try {
        // Use collection and query to get user by email
        const usersRef = collection(db, "users"); // Reference the "users" collection
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id; // Get the first document ID
            const userDocRef = doc(db, "users", docId); // Reference the document

            // Update the isVerified field
            await updateDoc(userDocRef, { isVerified: true });

            res.send(`Email ${email} verified successfully!`);
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error updating isVerified:", error);
        res.status(500).send("Internal server error.");
    }
});

const updateVerificationStatus = async(email , req,res)=>{
    try {
        // Use collection and query to get user by email
        const usersRef = collection(db, "users"); // Reference the "users" collection
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id; // Get the first document ID
            const userDocRef = doc(db, "users", docId); // Reference the document

            // Update the isVerified field
            await updateDoc(userDocRef, { isVerifying: true });

        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error updating isVerifying:", error);
    }
}

// API to send password reset email
app.post("/send-password-reset-email", (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).send("Email is required.");

    // Generate a password reset token
    const token = crypto.randomBytes(32).toString("hex");
    verificationTokens[token] = email;

    // Email options
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset Request",
        html: `${token}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error sending email.");
        }
        res.send("Password reset email sent!");
    });
});

// API to handle password reset request
app.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).send("Token and new password are required.");
    }

    if (!verificationTokens[token]) {
        return res.status(400).send("Invalid or expired token.");
    }

    const email = verificationTokens[token].toLowerCase(); // Normalize email to lowercase
    delete verificationTokens[token];

    try {
        console.log(`Resetting password for email: ${email}`);
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", email));
        const snapshot = await getDocs(q);

        console.log(`Snapshot data:`, snapshot.empty ? "No matching user" : snapshot.docs[0].data());

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            const userDocRef = doc(db, "users", docId);
            await updateDoc(userDocRef, { password: newPassword });

            res.send("Password reset successful!");
        } else {
            res.status(404).send("User not found.");
        }
    } catch (error) {
        console.error("Error resetting password:", error);
        res.status(500).send("Internal server error.");
    }
});



// API to verify the token
app.post("/verify-token", (req, res) => {
    const { token } = req.body;

    if (!token || !verificationTokens[token]) {
        return res.status(400).send("Invalid or expired token.");
    }

    // If the token is valid, return success
    res.send("Token verified!");
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});