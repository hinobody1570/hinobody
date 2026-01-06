"use client";

import { useState } from "react";
import { GoArrowLeft } from "react-icons/go";
import { FiLock } from "react-icons/fi";
import Link from "next/link";
import { ROUTE_PATHS } from "@/routes/paths";
import ConfirmationMessage from "@/components/reuseComponents/ConfirmationMessage";
import FormLabel from "@/components/reuseComponents/FormLabel";
import PasswordInput from "@/components/reuseComponents/PasswordInput";
import FormButton from "@/components/reuseComponents/FormButton";

const ResetPassword = () => {
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const validatePassword = () => {
    const errors: any = {};

    if (!newPassword) {
      errors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    return errors;
  };

  const handlePasswordChange = (field: "new" | "confirm", value: string) => {
    if (field === "new") {
      setNewPassword(value);
      setPasswordErrors((prev: any) => ({ ...prev, newPassword: "" }));
    } else {
      setConfirmPassword(value);
      setPasswordErrors((prev: any) => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handlePasswordReset = async () => {
    const errors = validatePassword();

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Password reset successfully");
      setIsLoading(false);
      setIsReset(true);

      // Redirect after 3 seconds
      setTimeout(() => {
        setIsReset(false);
        setNewPassword("");
        setConfirmPassword("");
      }, 3000);
    }, 1500);
  };

  if (isReset) {
    return (
      <ConfirmationMessage
        message="Your password has been successfully reset. You can now sign in with your new password.."
        title="Password Reset!"
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Back button */}
        <Link href={ROUTE_PATHS.LOGIN} className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-6 transition">
          <GoArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <FiLock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h1>
          <p className="text-gray-600">Create a strong password for your account</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* New Password */}
          <div>
            <FormLabel labelTitle="New Password" htmlForTitle="new-password" />
            <PasswordInput onChange={(e) => handlePasswordChange("new", e.target.value)} value={newPassword} error={passwordErrors.newPassword} />
          </div>

          {/* Confirm Password */}
          <div>
            <FormLabel labelTitle="Confirm Password" htmlForTitle="confirm-password" />
            <PasswordInput
              onChange={(e) => handlePasswordChange("confirm", e.target.value)}
              value={confirmPassword}
              error={passwordErrors.confirmPassword}
            />
          </div>

          {/* Submit */}
          <FormButton title="Reset Password" loadingTitle="Resetting..." handleSubmit={handlePasswordReset} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
