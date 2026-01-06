"use client";

import ConfirmationMessage from "@/components/reuseComponents/ConfirmationMessage";
import FormButton from "@/components/reuseComponents/FormButton";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BiCheckCircle } from "react-icons/bi";
import { BsEnvelope } from "react-icons/bs";
import { GoArrowLeft } from "react-icons/go";

export default function EmailVerification() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<any>([]);

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
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Verification code submitted:", verificationCode);
      setIsLoading(false);
      setIsVerified(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsVerified(false);
        setCode(["", "", "", "", "", ""]);
      }, 3000);
    }, 1500);
  };

  const handleResend = () => {
    if (resendTimer > 0) return;

    console.log("Resending verification code");
    setResendTimer(60);
    setCode(["", "", "", "", "", ""]);
    setError("");
    inputRefs.current[0]?.focus();
  };

  if (isVerified) {
    return <ConfirmationMessage message="Your email has been successfully verified. You can now access your account." title="Email Verified!" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <Link href={ROUTE_PATHS.REGISTER} className="cursor-pointer flex items-center text-gray-600 hover:text-gray-800 mb-6 transition">
          <GoArrowLeft className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Back</span>
        </Link>

        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <BsEnvelope className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">We've sent a 6-digit code to</p>
          <p className="text-gray-800 font-medium mt-1">your@email.com</p>
        </div>

        <div className="space-y-6">
          {/* Verification Code Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Enter Verification Code</label>
            <div className="flex justify-center gap-2 mb-2">
              {code.map((digit, index) => (
                <input
                  key={index}
                  //   ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  //   maxLength="1"
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
            title="Verify Email"
            loadingTitle="Verifying..."
            handleSubmit={() => handleVerify()}
            disabled={isLoading || code.some((digit) => !digit)}
          />

          {/* Resend Code */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
            {resendTimer > 0 ? (
              <p className="text-sm text-gray-500">
                Resend code in <span className="font-semibold text-blue-600">{resendTimer}s</span>
              </p>
            ) : (
              <button onClick={handleResend} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
