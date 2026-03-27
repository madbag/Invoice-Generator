import React from "react";
import SignUpForm from "../components/Auth/SignupForm";
import AuthLayout from "../components/Auth/AuthLayout";

const SignUpPage: React.FC = () => {
  return (
    <AuthLayout
      image="/signupBanner.png"
      title="Join Us"
      subtitle="Start creating professional invoices today."
    >
      <div>
        <SignUpForm />
      </div>
    </AuthLayout>
  );
};

export default SignUpPage;
