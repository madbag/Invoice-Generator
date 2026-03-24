import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Search from "../Search/Search";

interface TopbarProps {
  onMenuClick: () => void;
}

const Topbar = ({ onMenuClick }: TopbarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const displayName =
    (user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.email) || "User";

  const initials =
    user?.firstName && user?.lastName
      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
      : user?.email?.[0]?.toUpperCase() || "U";

  const handleProfileClick = () => {
    navigate("/dashboard/profile");
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[var(--card)] border-b border-[var(--border)] px-4 md:px-6">
      <div className="flex items-center justify-between h-full gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-[var(--secondary)] text-[var(--muted-foreground)]"
        >
          <MenuIcon />
        </button>

        {/* Search - hidden on small mobile */}
        <div className="hidden sm:block flex-1 max-w-md">
          <Search />
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {/* Profile dropdown */}
          <div
            onClick={handleProfileClick}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--secondary)] cursor-pointer transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center">
              <span className="text-white text-sm font-medium">{initials}</span>
            </div>
            <span className="hidden md:block text-sm font-medium text-[var(--foreground)]">
              {displayName}
            </span>
          </div>

          {/* Logout button */}
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--destructive)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <LogoutIcon />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const MenuIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 6h16M4 12h16M4 18h16"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
    />
  </svg>
);

export default Topbar;
