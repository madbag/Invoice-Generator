import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.tsx";

export default function GreetingCard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Display user's full name if available, else email, else "User"
  const displayName =
    (user?.firstName && user?.lastName ? `${user.firstName}` : user?.email) ||
    "User";

  return (
    <div className="flex flex-row items-center gap-10 p-8">
      <h1 className=" text-2xl font-bold mb-4">Hello, {displayName}</h1>
      <button
        onClick={() => navigate("/dashboard/create-invoice")}
        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
         + New Invoice
      </button>
    </div>
  );
}
