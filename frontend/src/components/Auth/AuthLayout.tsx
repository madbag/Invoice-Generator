import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  image: string;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, image, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="flex h-screen w-full bg-[var(--background)]">
      {/* Left Side: Image Section (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img 
          src={image} 
          alt="Auth Visual" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Optional Overlay for text on the image */}
        <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-12 text-white">
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg opacity-90">{subtitle}</p>
        </div>
      </div>

      {/* Right Side: Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;