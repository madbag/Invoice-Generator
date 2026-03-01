import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


const Topbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate(); // Assuming useNavigate is imported from react-router-dom

  // Display user's full name if available, else email, else "User"
  const displayName =
    (user?.firstName && user?.lastName ? `${user.firstName}` : user?.email) ||
    "User";

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <header className="w-full bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold">SEARCH FEATURE</h1>
      <div className="flex items-center gap-4">
        <span
          onClick={handleProfileClick}
          className="text-gray-700 cursor-pointer"
        >
          {displayName}
        </span>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
