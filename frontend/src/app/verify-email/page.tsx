"use client";

import ConfirmationMessage from "@/components/reuseComponents/ConfirmationMessage";
import FormButton from "@/components/reuseComponents/FormButton";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BsEnvelope } from "react-icons/bs";
import { GoArrowLeft } from "react-icons/go";
import { useSearchParams, useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useToast } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";

export default function EmailVerification() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRefs = useRef<any>([]);
  const { showSuccess, showError } = useToast();
  const t = useTranslations("auth.verifyEmailPage");
  const tToast = useTranslations("toast");

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(600); // 10 minutes = 600 seconds
  const [email, setEmail] = useState<string>("");

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailParam = searchParams?.get("email");
    const storedEmail = typeof window !== "undefined" ? localStorage.getItem("pending_verification_email") : null;
    const userEmail = emailParam || storedEmail || "";
    setEmail(userEmail);
  }, [searchParams]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: any) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }

    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every((digit) => digit !== "") && index === 5) {
      handleVerify(newCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: any) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);

    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();

    if (pastedData.length === 6) {
      handleVerify(newCode);
    }
  };

  const handleVerify = async (codeToVerify = code) => {
    const verificationCode = codeToVerify.join("");

    if (verificationCode.length !== 6) {
      setError(t("codeRequired"));
      return;
    }

    if (!email) {
      setError(t("emailNotFound"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the real verify email API
      const response = await authApi.verifyEmail(email, verificationCode);

      // Success - show success message and redirect
      setIsLoading(false);
      setIsVerified(true);

      // Clear stored email
      if (typeof window !== "undefined") {
        localStorage.removeItem("pending_verification_email");
      }

      showSuccess(tToast("emailVerified"));

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push(ROUTE_PATHS.DEFAULT);
      }, 1000);
    } catch (error: any) {
      // Handle API errors - stay on page
      setIsLoading(false);
      const errorMessage = error?.message || tToast("verificationFailed");
      setError(errorMessage);
      showError(errorMessage);

      // Clear the code inputs on error
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    if (!email) {
      setError(t("emailNotFound"));
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Call the resend OTP API
      await authApi.resendOtp(email);

      // Success - reset timer and code
      setResendTimer(600); // Reset to 10 minutes
      setCode(["", "", "", "", "", ""]);
      setError("");
      setIsLoading(false);
      showSuccess(tToast("otpResent"));
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      // Handle API errors
      setIsLoading(false);
      const errorMessage = error?.message || tToast("resendFailed");
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  if (isVerified) {
    return <ConfirmationMessage message={t("emailVerifiedMessage")} title={t("emailVerifiedTitle")} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link href={ROUTE_PATHS.REGISTER} className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-6 transition">
          <GoArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">{t("back")}</span>
        </Link>

        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <BsEnvelope className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("verifyYourEmail")}</h1>
          <p className="text-gray-600">{t("codeSentTo")}</p>
          <p className="text-gray-800 font-medium mt-1">{email || "your@email.com"}</p>
        </div>

        <div className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">{t("enterVerificationCode")}</label>
            <div className="flex justify-center gap-2 mb-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  // ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                    error ? "border-red-500" : "border-gray-300"
                  }`}
                />
              ))}
            </div>
            {error && <p className="mt-2 text-sm text-red-500 text-center">{error}</p>}
          </div>

          {/* Verify Button */}
          <FormButton
            title={t("verifyEmail")}
            loadingTitle={t("verifying")}
            handleSubmit={() => handleVerify()}
            disabled={isLoading || code.some((digit) => !digit)}
          />

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">{t("didntReceiveCode")}</p>
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                {t("resendCodeIn")}{" "}
                <span className="font-semibold text-blue-600">
                  {Math.floor(resendTimer / 60)}:{(resendTimer % 60).toString().padStart(2, "0")}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {t("resendCode")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
