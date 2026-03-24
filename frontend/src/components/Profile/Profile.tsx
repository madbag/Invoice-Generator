import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../../api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessDetails?: {
    address: string;
    contact: string;
    logoUrl: string;
  };
}

const Profile: React.FC = () => {
  const { token, user } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessDetails: {
      address: "",
      contact: "",
      logoUrl: "",
    },
  });
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const { data } = await getProfile();
        setFormData({
          ...data,
          password: "",
          businessDetails: data.businessDetails || {
            address: "",
            contact: "",
            logoUrl: "",
          },
        });
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("business.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        businessDetails: {
          ...prev.businessDetails!,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile(formData);
      setFormData({ ...data, password: "" });
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        text: "Failed to update profile. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    )
      return;

    try {
      await deleteProfile();
      localStorage.removeItem("profile");
      navigate("/signup");
    } catch (error) {
      console.error("Delete failed", error);
      setMessage({
        text: "Failed to delete account. Please try again.",
        type: "error",
      });
    }
  };

  const initials =
    formData.firstName && formData.lastName
      ? `${formData.firstName[0]}${formData.lastName[0]}`.toUpperCase()
      : formData.email?.[0]?.toUpperCase() || "U";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
          My Profile
        </h1>
        <p className="text-[var(--muted-foreground)] mt-1">
          Manage your account settings and business details
        </p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20"
              : "bg-[var(--destructive)]/10 text-[var(--destructive)] border border-[var(--destructive)]/20"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">
                  {initials}
                </span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">
                {formData.email}
              </p>

              <div className="w-full mt-6 pt-6 border-t border-[var(--border)]">
                <div className="text-left space-y-3">
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Member Since
                    </p>
                    <p className="text-sm text-[var(--foreground)]">
                      {new Date().toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Account Status
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)]">
                      <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-[var(--destructive)] mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Once you delete your account, there is no going back.
            </p>
            <button
              onClick={handleDelete}
              className="w-full px-4 py-2 bg-[var(--destructive)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter last name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter email address"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Leave blank to keep current password"
                />
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
              Business Details
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              These details will appear on your invoices
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Business Address
                </label>
                <textarea
                  name="business.address"
                  value={formData.businessDetails?.address || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  placeholder="Enter your business address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Business Contact
                </label>
                <input
                  type="text"
                  name="business.contact"
                  value={formData.businessDetails?.contact || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="Enter business phone number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                  Logo URL
                </label>
                <input
                  type="text"
                  name="business.logoUrl"
                  value={formData.businessDetails?.logoUrl || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Instructions for MongoDB */}
      <div className="mt-8 bg-[var(--secondary)] border border-[var(--border)] rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
          Updating User Data in MongoDB (VSCode)
        </h3>
        <div className="text-sm text-[var(--muted-foreground)] space-y-3">
          <p>To manually update user data in your MongoDB database:</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>
              <strong className="text-[var(--foreground)]">
                Open MongoDB Compass
              </strong>{" "}
              or use the MongoDB extension in VSCode
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Connect to your database
              </strong>{" "}
              using your connection string from the .env file
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Navigate to the users collection
              </strong>{" "}
              in your database
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Find the user document
              </strong>{" "}
              by email or _id
            </li>
            <li>
              <strong className="text-[var(--foreground)]">
                Edit the fields
              </strong>{" "}
              directly in the document viewer
            </li>
          </ol>
          <div className="mt-4 p-4 bg-[var(--card)] rounded-lg">
            <p className="text-xs text-[var(--muted-foreground)] mb-2">
              Example MongoDB update command:
            </p>
            <code className="text-xs text-[var(--primary)] block overflow-x-auto">
              {`db.users.updateOne(
  { email: "your@email.com" },
  { $set: { 
    firstName: "John",
    lastName: "Doe",
    "businessDetails.address": "123 Main St",
    "businessDetails.contact": "+1 234 567 890"
  }}
)`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
