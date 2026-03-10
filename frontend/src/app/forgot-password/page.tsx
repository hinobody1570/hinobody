"use client";

import FormButton from "@/components/reuseComponents/FormButton";
import FormInput from "@/components/reuseComponents/FormInput";
import FormLabel from "@/components/reuseComponents/FormLabel";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useState } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsEnvelope } from "react-icons/bs";
import { FiLock } from "react-icons/fi";
import { GoArrowLeft } from "react-icons/go";
import { useTranslations } from "next-intl";
import { authApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";

export default function ForgotPassword() {
  const t = useTranslations("auth.forgotPasswordPage");
  const tToast = useTranslations("toast");
  const { showSuccess, showError } = useToast();
  const [step, setStep] = useState("email"); // 'email', 'success', 'reset'
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setEmailError(t("emailRequired"));
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError(t("emailInvalid"));
      return false;
    }
    return true;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call the real API
      await authApi.forgotPassword(email);
      setIsLoading(false);
      showSuccess(tToast("forgotPasswordSuccess"));
      setStep("success");
    } catch (error: any) {
      // Handle API errors
      setIsLoading(false);
      const errorMessage = error?.message || tToast("forgotPasswordError");
      showError(errorMessage);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleEmailSubmit();
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) setEmailError("");
  };

  // Email Step
  if (step === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <Link href={ROUTE_PATHS.LOGIN} className=" cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-6 transition">
            <GoArrowLeft className="w-5 h-5 mr-2" />
            <span className="text-sm font-medium">{t("backToLogin")}</span>
          </Link>

          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <FiLock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("forgotPasswordTitle")}</h1>
            <p className="text-gray-600">{t("noWorries")}</p>
          </div>

          <div className="space-y-6">
            {/* Email Field */}
            <div>
              <FormLabel required labelTitle={t("emailAddress")} htmlForTitle="email" />
              <FormInput
                type="email"
                icon={<BsEnvelope className="h-5 w-5 text-gray-400" />}
                id="email"
                onKeyPress={handleKeyPress}
                name="email"
                onChange={handleEmailChange}
                value={email}
                error={emailError}
                placeholder="you@example.com"
              />
            </div>

            {/* Submit Button */}
            <FormButton title={t("sendResetLink")} loadingTitle={t("sending")} handleSubmit={handleEmailSubmit} disabled={isLoading} />
          </div>
        </div>
      </div>
    );
  }

  // Success Step
  if (step === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                <BiCheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("checkYourEmail")}</h1>
            <p className="text-gray-600 mb-1">{t("resetLinkSent")}</p>
            <p className="text-gray-800 font-medium">{email}</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">{t("resetLinkInstructions")}</p>
          </div>

          <button
            onClick={() => console.log("Open email app")}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition mb-3 cursor-pointer"
          >
            {t("openEmailApp")}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">{t("didntReceiveEmail")}</p>
            <button 
              onClick={handleEmailSubmit} 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? t("sending") : t("resendEmail")}
            </button>
          </div>
          <div className="mt-6 text-center">
            <Link
              href={ROUTE_PATHS.LOGIN}
              className="cursor-pointer flex items-center justify-center mx-auto text-gray-600 hover:text-gray-800 transition"
            >
              <GoArrowLeft className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{t("backToLogin")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
