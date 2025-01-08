import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import upload from "../lib/upload";
import { UserTypes } from "../../type";

import { getAuth } from "firebase/auth";

import { updatePassword , reauthenticateWithCredential , EmailAuthProvider } from "firebase/auth";

const UpdateUserDetails = ({ currentUser }: UserTypes) => {

  const auth = getAuth();
  const user = auth.currentUser;


  const [activeSection, setActiveSection] = useState("personalDetails"); // Determines which section is active
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatarChange = (e: any) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleUpdatingDetails = async (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { firstName, lastName, email, location } = Object.fromEntries(formData);

    try {
      setLoading(true);
      let imageUrl: string = currentUser?.avatar;

      if (avatar.file) {
        imageUrl = await upload(avatar.file);
      }

      const userRef = doc(db, "users", currentUser?.id);
      await updateDoc(userRef, {
        firstName,
        lastName,
        email,
        location,
        avatar: imageUrl,
      });

      setErrMsg("");
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      setErrMsg("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { currentPassword, newPassword } = Object.fromEntries(formData) as {currentPassword:string , newPassword: string};

    try {
      setLoading(true);

      if(user){
        // Re-authenticate the user
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        await reauthenticateWithCredential(user, credential);

        // Update the password
        await updatePassword(user, newPassword);

        setErrMsg("");
      }

    } catch (error) {
      console.error("Error updating password:", error);
      setErrMsg("Failed to update password. Ensure current password is correct.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-x-4">
      {/* Left Section */}
      <div className="flex flex-col items-center border-r pr-4">
        <h2 className="text-xl font-semibold mb-4">Settings</h2>
        <button
          onClick={() => setActiveSection("personalDetails")}
          className={`py-2 px-4 w-full text-left ${
            activeSection === "personalDetails" ? "bg-gray-200" : ""
          }`}
        >
          Personal Details
        </button>
        <button
          onClick={() => setActiveSection("changePassword")}
          className={`py-2 px-4 w-full text-left ${
            activeSection === "changePassword" ? "bg-gray-200" : ""
          }`}
        >
          Change Password
        </button>
      </div>

      {/* Right Section */}
      <div className="pl-4">
        {activeSection === "personalDetails" && (
          <form onSubmit={handleUpdatingDetails} className="space-y-4">
            <h2 className="text-lg font-semibold">Update Personal Details</h2>
            <img
              src={avatar.url || currentUser?.avatar}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="block"
            />
            <input
              type="text"
              name="firstName"
              defaultValue={currentUser?.firstName}
              placeholder="First Name"
              required
              className="block w-full border p-2 rounded"
            />
            <input
              type="text"
              name="lastName"
              defaultValue={currentUser?.lastName}
              placeholder="Last Name"
              required
              className="block w-full border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              defaultValue={currentUser?.email}
              placeholder="Email"
              required
              className="block w-full border p-2 rounded"
            />
            <input
              type="text"
              name="location"
              defaultValue={currentUser?.location}
              placeholder="Location"
              className="block w-full border p-2 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </form>
        )}

        {activeSection === "changePassword" && (
          <form onSubmit={handleChangePassword} className="space-y-4">
            <h2 className="text-lg font-semibold">Change Password</h2>
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              required
              className="block w-full border p-2 rounded"
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              required
              className="block w-full border p-2 rounded"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>
        )}

        {errMsg && <p className="text-red-500">{errMsg}</p>}
      </div>
    </div>
  );
};

export default UpdateUserDetails;
