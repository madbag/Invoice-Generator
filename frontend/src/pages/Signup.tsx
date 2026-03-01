import React from "react";
import SignUpForm from "../components/Auth/SignupForm";

const SignUpPage: React.FC = () => {
  return (
    <div className="flex justify-center bg-gray-100">
      <SignUpForm />
    </div>
  );
};

export default SignUpPage;