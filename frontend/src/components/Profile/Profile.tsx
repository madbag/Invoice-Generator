import React, { useEffect, useState } from "react";
import { getProfile, updateProfile, deleteProfile } from "../../api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { getInitials } from "../../utils/initials";

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture: string | null;
  businessDetails: {
    businessName: string;
    contact: string;
    instagram: string;
    facebook: string;
    website: string;
    other: string;
  };
}

const MAX_PHOTO_SIZE_BYTES = 2 * 1024 * 1024; // 2MB, before base64 inflation

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
  const { token, updateUser } = useAuth();
  const [formData, setFormData] = useState<ProfileData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    profilePicture: null,
    businessDetails: {
      businessName: "",
      contact: "",
      instagram: "",
      facebook: "",
      website: "",
      other: "",
    },
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
          profilePicture: data.profilePicture || null,
          businessDetails: {
            businessName: data.businessDetails?.businessName || "",
            contact: data.businessDetails?.contact || "",
            instagram: data.businessDetails?.instagram || "",
            facebook: data.businessDetails?.facebook || "",
            website: data.businessDetails?.website || "",
            other: data.businessDetails?.other || "",
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage({ text: "Please select an image file.", type: "error" });
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      setMessage({ text: "Image must be smaller than 2MB.", type: "error" });
      return;
    }

    // Uploading a photo counts as starting an edit, same as typing into any
    // other field — enters edit mode so Save/Cancel appear if you weren't
    // already editing.
    if (!isEditing) handleEdit();

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, profilePicture: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, profilePicture: null }));
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
        profilePicture: data.profilePicture || null,
        businessDetails: {
          businessName: data.businessDetails?.businessName || "",
          contact: data.businessDetails?.contact || "",
          instagram: data.businessDetails?.instagram || "",
          facebook: data.businessDetails?.facebook || "",
          website: data.businessDetails?.website || "",
          other: data.businessDetails?.other || "",
        },
      };
      setFormData(updated);
      setSavedData(updated);
      updateUser({
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        profilePicture: updated.profilePicture,
        businessDetails: updated.businessDetails,
      });
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

  const initials = getInitials(formData);

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
          <p className="text-[var(--muted-foreground)] text-sm md:text-lg mt-1">
            {isEditing ? "Edit your account details below" : "Manage your account settings and business details"}
          </p>
        </div>

        {/* Edit / Save / Cancel buttons */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className=" text-sm px-4 py-2.5 bg-[var(--primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
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
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-white ring-2 ring-[var(--primary)] flex items-center justify-center overflow-hidden">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-[var(--primary)]">{initials}</span>
                  )}
                </div>

                <label
                  htmlFor="profile-photo-input"
                  title="Change photo"
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--primary)] text-white flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity border-2 border-[var(--card)]"
                >
                  <CameraIcon />
                </label>
                <input
                  id="profile-photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                {formData.profilePicture && isEditing && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                    className="absolute top-0 right-0 w-6 h-6 rounded-full bg-[var(--destructive)] text-white flex items-center justify-center hover:opacity-90 transition-opacity border-2 border-[var(--card)]"
                  >
                    <RemoveIcon />
                  </button>
                )}
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
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1"> Your Business Details</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              These details will appear on your invoices
            </p>
            <div className="space-y-4">
              <Field
                label="Business Name"
                name="business.businessName"
                value={formData.businessDetails.businessName}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter your business name"
              />
              <Field
                label="Contact"
                name="business.contact"
                value={formData.businessDetails.contact}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Enter business phone number"
              />
            </div>
          </div>

          {/* Social & Links — all optional, shown on invoices only when filled in */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">Social &amp; Links</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Optional — shown on your invoices below the thank-you note when filled in
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Instagram Handle"
                name="business.instagram"
                value={formData.businessDetails.instagram}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="@yourbusiness"
              />
              <Field
                label="Facebook Handle"
                name="business.facebook"
                value={formData.businessDetails.facebook}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="@yourbusiness"
              />
              <Field
                label="Website"
                name="business.website"
                value={formData.businessDetails.website}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="www.yourbusiness.com"
              />
              <Field
                label="Other"
                name="business.other"
                value={formData.businessDetails.other}
                isEditing={isEditing}
                onChange={handleChange}
                placeholder="Any other link or handle"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CameraIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const RemoveIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default Profile;
