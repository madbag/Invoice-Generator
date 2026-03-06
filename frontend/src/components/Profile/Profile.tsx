import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../../api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const { data } = await getProfile();
        console.log("Fetched profile:", data); // debug here

        setFormData(data);
      } catch (error) {
        console.error("Error fetching profile", error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const { data } = await updateProfile(formData); // backend returns updated profile
      setFormData(data); // update form with saved data
      setMessage("Profile updated successfully ✅");
    } catch (error) {
      setMessage("Update failed ❌");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    
    // console.log("Token for delete:", JSON.parse(localStorage.getItem("profile") || "{}").token);
    
    try {
      await deleteProfile();
      localStorage.removeItem("profile");
      navigate("/signup");
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="flex w-full items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">My Profile</h2>

        {message && (
          <div className="bg-green-100 text-green-600 p-2 rounded mb-4 text-sm">
            {message}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            placeholder="Enter new password"
            onChange={handleChange}
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-400"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition mb-3"
        >
          Save Changes
        </button>

        <button
          onClick={handleDelete}
          className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;
