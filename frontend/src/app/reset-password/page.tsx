"use client";

import ConfirmationMessage from "@/components/reuseComponents/ConfirmationMessage";
import FormButton from "@/components/reuseComponents/FormButton";
import FormLabel from "@/components/reuseComponents/FormLabel";
import PasswordInput from "@/components/reuseComponents/PasswordInput";
import { useToast } from "@/contexts/ToastContext";
import { authApi } from "@/lib/api";
import { isValidPasswordFormat } from "@/utils/helperFunction";
import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FiLock } from "react-icons/fi";
import { GoArrowLeft } from "react-icons/go";

const ResetPassword = () => {
  const t = useTranslations("auth.resetPasswordPage");
  const tAuth = useTranslations("auth");
  const tToast = useTranslations("toast");
  const tReset = useTranslations("resetPassword");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const [passwordErrors, setPasswordErrors] = useState<any>({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [resetToken, setResetToken] = useState<string>("");

  // Get token from URL query parameter
  useEffect(() => {
    const token = searchParams?.get("token");
    if (token) {
      setResetToken(token);
    } else {
      // If no token, show error toast
      showError(tReset('invalidToken'));
    }
  }, [searchParams, showError]);

  const validatePassword = () => {
    const errors: any = {};

    if (!newPassword) {
      errors.newPassword = t("passwordRequired");
    } else if (!isValidPasswordFormat(newPassword)) {
      errors.newPassword = tAuth("passwordInvalidFormat");
    }

    if (!confirmPassword) {
      errors.confirmPassword = t("confirmPasswordRequired");
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = t("passwordsDoNotMatch");
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
    if (!resetToken) {
      showError(tReset('invalidToken'));
      return;
    }

    const errors = validatePassword();

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setIsLoading(true);

    try {
      // Call the real API
      await authApi.resetPassword(resetToken, newPassword);
      setIsLoading(false);
      showSuccess(tToast("resetPasswordSuccess"));
      setIsReset(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(ROUTE_PATHS.DEFAULT);
      }, 500);
    } catch (error: any) {
      // Handle API errors
      setIsLoading(false);
      const errorMessage = error?.message || tToast("resetPasswordError");
      showError(errorMessage);
      
      // Clear password fields on error
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  if (isReset) {
    return (
      <ConfirmationMessage
        message={t("passwordResetMessage")}
        title={t("passwordResetTitle")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Back button */}
        <Link href={ROUTE_PATHS.DEFAULT} className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-6 transition">
          <GoArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <FiLock className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("setNewPassword")}</h1>
          <p className="text-gray-600">{t("createStrongPassword")}</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* New Password */}
          <div>
            <FormLabel required labelTitle={t("newPassword")} htmlForTitle="new-password" />
            <PasswordInput onChange={(e) => handlePasswordChange("new", e.target.value)} value={newPassword} error={passwordErrors.newPassword} />
          </div>

          {/* Confirm Password */}
          <div>
            <FormLabel required labelTitle={t("confirmPassword")} htmlForTitle="confirm-password" />
            <PasswordInput
              onChange={(e) => handlePasswordChange("confirm", e.target.value)}
              value={confirmPassword}
              error={passwordErrors.confirmPassword}
            />
          </div>

          {/* Submit */}
          <FormButton 
            title={t("resetPassword")} 
            loadingTitle={t("resetting")} 
            handleSubmit={handlePasswordReset} 
            disabled={isLoading || !resetToken} 
          />
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
