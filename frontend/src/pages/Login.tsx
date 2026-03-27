import React from "react";
import SignInForm from "../components/Auth/LoginForm";
import AuthLayout from "../components/Auth/AuthLayout";

const SignInPage: React.FC = () => {
  return (
    <AuthLayout
      image="/signinBanner.png"
      title="Welcome Back"
      subtitle="Manage your invoices with ease."
    >
      <div>
        <SignInForm />
      </div>
    </AuthLayout>
  );
};

export default SignInPage;
