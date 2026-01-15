"use client";

import FormButton from "@/components/reuseComponents/FormButton";
import FormInput from "@/components/reuseComponents/FormInput";
import FormLabel from "@/components/reuseComponents/FormLabel";
import PasswordInput from "@/components/reuseComponents/PasswordInput";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BsEnvelope } from "react-icons/bs";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";

interface loginFormType {
  email?: string;
  password?: string;
}

type LoginFormErrors = Partial<Record<keyof loginFormType, string>>;

export default function Home() {
  const t = useTranslations("auth.loginPage");
  const tAuth = useTranslations("auth");
  const tToast = useTranslations("toast");
  const { login: authLogin, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<loginFormType>({
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
      // Call the real API through AuthContext
      // The login function now returns the user
      const loggedInUser = await authLogin(formData.email!, formData.password!);

      // Success - show toast
      showSuccess(tToast("loginSuccess"));
      setIsLoading(false);
      // Redirect admin users to admin panel, others to home
      if (loggedInUser?.role === 'ADMIN') {
        router.push(ROUTE_PATHS.ADMIN_USERS);
      } else {
        router.push(ROUTE_PATHS.HOME);
      }
    } catch (error: any) {
      // Handle API errors
      setIsLoading(false);
      const errorMessage = error?.message || tToast("loginError");
      showError(errorMessage);

      // Clear password field on error
      setFormData((prev) => ({ ...prev, password: "" }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("welcomeBack")}</h1>
          <p className="text-gray-600">{t("signInToContinue")}</p>
        </div>

        <div className="space-y-6">
          {/* Email Field */}
          <div>
            <FormLabel labelTitle={t("emailAddress")} htmlForTitle="email" />
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
            />
          </div>

          {/* Password Field */}
          <div>
            <FormLabel labelTitle={tAuth("password")} htmlForTitle="password" />
            <PasswordInput onChange={handleChange} onKeyPress={handleKeyPress} value={formData.password} error={errors.password} />
          </div>

          {/* Remember Me & Forgot Password */}
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

          {/* Submit Button */}
          <FormButton title={t("signIn")} loadingTitle={t("signingIn")} handleSubmit={handleSubmit} disabled={isLoading} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {tAuth("dontHaveAccount")}{" "}
            <Link href={ROUTE_PATHS.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium">
              {t("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
