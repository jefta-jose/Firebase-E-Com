import { db } from "../firebase.js";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";

export const updateVerificationStatus = async(email , req,res)=>{
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