"use client";

import FormButton from "@/components/reuseComponents/FormButton";
import FormInput from "@/components/reuseComponents/FormInput";
import FormLabel from "@/components/reuseComponents/FormLabel";
import PasswordInput from "@/components/reuseComponents/PasswordInput";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BsEnvelope } from "react-icons/bs";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { authApi } from "@/lib/api";

interface LoginFormType {
  email?: string;
  password?: string;
}

type LoginFormErrors = Partial<Record<keyof LoginFormType, string>>;

export default function LoginPage() {
  const t = useTranslations("auth.loginPage");
  const tAuth = useTranslations("auth");
  const tToast = useTranslations("toast");
  const { login: authLogin, isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();

  const redirectTo = useMemo(() => {
    const raw = searchParams?.get("redirect") || "";
    // Allow only internal redirects
    if (!raw.startsWith("/")) return "";
    if (raw.startsWith("//")) return "";
    return raw;
  }, [searchParams]);

  const [formData, setFormData] = useState<LoginFormType>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = t("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordMinLength8");
    }

    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const loggedInUser = await authLogin(formData.email!, formData.password!);
      showSuccess(tToast("loginSuccess"));

      if (loggedInUser?.role === "ADMIN") {
        router.push(ROUTE_PATHS.ADMIN_USERS);
        return;
      }

      router.push(redirectTo || ROUTE_PATHS.DEFAULT);
    } catch (error: any) {
      const rawMessage = error?.message || "";

      // If email is not verified yet, resend OTP and send user to verification flow
      if (rawMessage === "Please verify your email address before logging in") {
        try {
          if (formData.email) {
            // Store email for verification page (same as register flow)
            if (typeof window !== "undefined") {
              localStorage.setItem("pending_verification_email", formData.email);
            }

            // Trigger resend OTP so user gets a fresh code
            await authApi.resendOtp(formData.email);
          }

          showSuccess(tToast("otpResent"));
          router.push(`${ROUTE_PATHS.VERIFY_EMAIL}?email=${encodeURIComponent(formData.email!)}`);
          return;
        } catch {
          // If resend fails, fall back to generic error toast
          showError(tToast("resendFailed"));
        }
      } else {
        const errorMessage = rawMessage || tToast("loginError");
        showError(errorMessage);
      }

      setFormData((prev) => ({ ...prev, password: "" }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  const handleAppleLogin = async () => {
    authApi.appleLogin();
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push(ROUTE_PATHS.DEFAULT);
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("welcomeBack")}</h1>
          <p className="text-gray-600">{t("signInToContinue")}</p>
        </div>

        <form
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-6"
        >
          <div>
            <FormLabel required labelTitle={t("emailAddress")} htmlForTitle="email" />
            <FormInput
              type="email"
              icon={<BsEnvelope className="h-5 w-5 text-gray-400" />}
              id="email"
              onKeyPress={handleKeyPress}
              name="email"
              onChange={handleChange}
              value={formData.email}
              error={errors.email}
              placeholder="you@example.com"
              autoComplete="nope"
              readOnlyUntilFocus
            />
          </div>

          <div>
            <FormLabel required labelTitle={tAuth("password")} htmlForTitle="password" />
            <PasswordInput onChange={handleChange} onKeyPress={handleKeyPress} value={formData.password} error={errors.password} />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                {t("rememberMe")}
              </label>
            </div>
            <Link href={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              {t("forgotPassword")}
            </Link>
          </div>

          <FormButton title={t("signIn")} loadingTitle={t("signingIn")} handleSubmit={handleSubmit} disabled={isLoading} />
        </form>
        <button
          onClick={() => router.push(ROUTE_PATHS.DEFAULT)}
          className="cursor-pointer mt-4 w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t("guestUser")}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t("orContinueWith")}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => authApi.googleLogin()}
            className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-gray-700 font-medium">{t("continueWithGoogle")}</span>
          </button>

          <button
            type="button"
            onClick={handleAppleLogin}
            className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#000000">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.57 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            <span className="text-gray-700 font-medium">{t("continueWithApple")}</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
            <span>
              {tAuth("dontHaveAccount")}{" "}
              <Link href={ROUTE_PATHS.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium">
                {t("signUp")}
              </Link>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
