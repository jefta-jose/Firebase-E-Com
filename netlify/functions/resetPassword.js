import { db } from "../firebase.js";
import { collection, doc, getDoc, deleteDoc, query, getDocs, updateDoc, where } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

// API to handle password reset request
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed. Use POST." }),
    };
  }

  const { token, newPassword } = JSON.parse(event.body);

  if (!token || !newPassword) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Token and new password are required." }),
    };
  }

  try {
    // Retrieve token from Firestore
    const tokenDocRef = doc(collection(db, "passwordResetTokens"), token);
    const tokenDoc = await getDoc(tokenDocRef);

    if (!tokenDoc.exists()) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid or expired token." }),
      };
    }

    const { email, expiresAt } = tokenDoc.data();

    // Check token expiration
    if (Date.now() > expiresAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Token has expired." }),
      };
    }

    // Delete the token after successful verification
    await deleteDoc(tokenDocRef);

    console.log(`Resetting password for email: ${email}`);

    // Query Firestore to find the user by email
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const docId = snapshot.docs[0].id;
      const userDocRef = doc(db, "users", docId);

      // Update the user's password
      await updateDoc(userDocRef, { password: newPassword });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Password reset successful!" }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "User not found." }),
      };
    }
  } catch (error) {
    console.error("Error resetting password:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }
};
