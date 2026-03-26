import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../../api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  businessDetails: {
    address: string;
    contact: string;
  };
}

const Field = ({
  label,
  value,
  isEditing,
  name,
  type = "text",
  onChange,
  placeholder,
  isTextarea = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  name: string;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  isTextarea?: boolean;
}) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">
      {label}
    </label>
    {isEditing ? (
      isTextarea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          rows={3}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-[var(--secondary)] border border-[var(--border)] rounded-lg text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      )
    ) : (
      <p className="text-[var(--foreground)] py-2.5 px-1 border-b border-[var(--border)]">
        {value || <span className="text-[var(--muted-foreground)] italic">Not provided</span>}
      </p>
    )}
  </div>
);

const Profile: React.FC = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    businessDetails: { address: "", contact: "" },
  });
  // Snapshot used to restore data if the user cancels
  const [savedData, setSavedData] = useState<ProfileData>(formData);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const { data } = await getProfile();
        const loaded: ProfileData = {
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          password: "",
          businessDetails: {
            address: data.businessDetails?.address || "",
            contact: data.businessDetails?.contact || "",
          },
        };
        setFormData(loaded);
        setSavedData(loaded);
      } catch (error) {
        console.error("Error fetching profile", error);
        setMessage({ text: "Failed to load profile. Please refresh.", type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("business.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        businessDetails: { ...prev.businessDetails, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = () => {
    setSavedData(formData); // take a snapshot before editing
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(savedData); // restore snapshot
    setIsEditing(false);
    setMessage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data } = await updateProfile(formData);
      const updated: ProfileData = {
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        email: data.email || "",
        password: "",
        businessDetails: {
          address: data.businessDetails?.address || "",
          contact: data.businessDetails?.contact || "",
        },
      };
      setFormData(updated);
      setSavedData(updated);
      setIsEditing(false);
      setMessage({ text: "Profile updated successfully!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: "Failed to update profile. Please try again.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    try {
      await deleteProfile();
      localStorage.removeItem("profile");
      navigate("/signup");
    } catch (error) {
      setMessage({ text: "Failed to delete account. Please try again.", type: "error" });
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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">My Profile</h1>
          <p className="text-[var(--muted-foreground)] mt-1">
            {isEditing ? "Edit your account details below" : "Manage your account settings and business details"}
          </p>
        </div>

        {/* Edit / Save / Cancel buttons */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-5 py-2.5 border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium hover:bg-[var(--secondary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
        )}
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
        {/* Profile Card — left column, read-only summary */}
        <div className="lg:col-span-1">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-[var(--primary)] flex items-center justify-center mb-4">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                {formData.firstName} {formData.lastName}
              </h2>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">{formData.email}</p>

              <div className="w-full mt-6 pt-6 border-t border-[var(--border)] text-left space-y-3">
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Member Since</p>
                  <p className="text-sm text-[var(--foreground)]">
                    {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Account Status</p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-[var(--accent)]">
                    <span className="w-2 h-2 bg-[var(--accent)] rounded-full" />
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-[var(--destructive)] mb-2">Danger Zone</h3>
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

        {/* Right column — Personal + Business fields */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="First Name"
                name="firstName"
                value={formData.firstName}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter first name"
              />
              <Field
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter last name"
              />
              <div className="sm:col-span-2">
                <Field
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  isEditing={isEditing}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>

              {/* Password only shown in edit mode */}
              {isEditing && (
                <div className="sm:col-span-2">
                  <Field
                    label="New Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    isEditing={isEditing}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Business Details</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              These details will appear on your invoices
            </p>
            <div className="space-y-4">
              <Field
                label="Business Address"
                name="business.address"
                value={formData.businessDetails.address}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter your business address"
                isTextarea={true}
              />
              <Field
                label="Business Contact"
                name="business.contact"
                value={formData.businessDetails.contact}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter business phone number"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;