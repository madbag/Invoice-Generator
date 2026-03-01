import React from "react";
import SignInForm from "../components/Auth/LoginForm";

const SignInPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center bg-gray-100">
      <SignInForm />
    </div>
  );
};

export default SignInPage;