import { useNavigate } from "react-router-dom";

const ArrowIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex h-screen w-full">
      {/* Left Side: Hero content */}
      <div className="w-full lg:w-1/2 bg-[#120e28] flex items-center px-6 sm:px-12 md:px-16 lg:px-20 overflow-y-auto">
        <div className="max-w-xl py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 text-sm mb-8">
            No signup required to send your first invoice
            <ArrowIcon />
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
            Create, send, & get paid,{" "}
            <span className="text-violet-400">effortlessly.</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-10 max-w-lg">
            Professional invoices for freelancers and small businesses. Bill
            clients, track payments, and get paid faster - try it now, no
            account needed.
          </p>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-violet-600 text-white font-medium hover:bg-violet-500 transition-colors"
            >
              Dashboard
              <ArrowIcon />
            </button>
            <button
              onClick={() => navigate("/dashboard/create-invoice")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 transition-colors"
            >
              Create Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Image Section (same image + copy as the sign-in page, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="/signinBanner.png"
          alt="Auth Visual"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">Welcome</h1>
          <p className="text-lg opacity-90">Manage your invoices with ease.</p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
