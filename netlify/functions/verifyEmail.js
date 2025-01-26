import { db } from "../firebase.js";
import { collection, doc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";

exports.handler = async (event) => {
  const { token } = event.queryStringParameters;

  if (!token) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Token is required." }),
    };
  }

  try {
    // Retrieve token from Firestore
    const tokenDocRef = doc(collection(db, "verificationTokens"), token);
    const tokenDoc = await getDoc(tokenDocRef);

    if (!tokenDoc.exists()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or expired token." }),
      };
    }

    const { email, expiresAt } = tokenDoc.data();

    // Check if token has expired (24 hours expiry, for example)
    if (Date.now() > expiresAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token has expired." }),
      };
    }

    // Query the "users" collection to mark the email as verified
    const userRef = collection(db, "users");
    const userDoc = await getDoc(doc(userRef, email));

    if (userDoc.exists()) {
      // Update user verification status
      await updateDoc(userDoc.ref, { isVerified: true });

      // Delete the token after successful verification
      await deleteDoc(tokenDocRef);

      return {
        statusCode: 200,
        body: JSON.stringify({ message: `Email ${email} verified successfully!` }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found." }),
      };
    }

  } catch (error) {
    console.error("Error verifying token:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to verify email." }),
    };
  }
};
