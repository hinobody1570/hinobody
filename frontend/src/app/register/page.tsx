"use client";

import ConfirmationMessage from "@/components/reuseComponents/ConfirmationMessage";
import FormButton from "@/components/reuseComponents/FormButton";
import FormInput from "@/components/reuseComponents/FormInput";
import FormLabel from "@/components/reuseComponents/FormLabel";
import PasswordInput from "@/components/reuseComponents/PasswordInput";
import { ROUTE_PATHS } from "@/routes/paths";
import Link from "next/link";
import { useState } from "react";
import { BsEnvelope } from "react-icons/bs";
import { FiUser } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { register } from "@/lib/auth";
import { isValidPasswordFormat } from "@/utils/helperFunction";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";

interface SignUpFormType {
  email?: string;
  nickname?: string;
  password?: string;
}

type SignUpFormErrors = Partial<Record<keyof SignUpFormType, string>>;

export default function SignupForm() {
  const t = useTranslations("auth.registerPage");
  const tAuth = useTranslations("auth");
  const tToast = useTranslations("toast");
  const router = useRouter();
  const { locale } = useLanguage();
  const { showSuccess, showError } = useToast();
  const [formData, setFormData] = useState<SignUpFormType>({
    email: "",
    nickname: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: SignUpFormErrors = {};

    if (!formData.email) {
      newErrors.email = t("emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("emailInvalid");
    }

    if (!formData.nickname) {
      newErrors.nickname = t("nicknameRequired");
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = t("nicknameMinLength");
    }

    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (!isValidPasswordFormat(formData.password)) {
      newErrors.password = tAuth("passwordInvalidFormat");
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
      // Call the real API
      await register({
        email: formData.email!,
        password: formData.password!,
        nickname: formData.nickname!,
        language: locale.toUpperCase() as any, // Convert to Language enum format
      });

      // Success - show toast and redirect
      showSuccess(tToast("registerSuccess"));
      
      // Store email for verification page
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_verification_email", formData.email!);
      }
      
      setIsSubmitted(true);
      
    } catch (error: any) {
      // Handle API errors
      setIsLoading(false);
      const errorMessage = error?.message || tToast("registerError");
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

  if (isSubmitted) {
    return (
      <ConfirmationMessage 
        message={tAuth("registrationSuccessful")} 
        title={t("accountCreatedTitle")} 
        buttonTitle="Verify Email"
        onClick={()=> router.push(`${ROUTE_PATHS.VERIFY_EMAIL}?email=${encodeURIComponent(formData.email!)}`)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("createAccount")}</h1>
          <p className="text-gray-600">{t("joinUsToday")}</p>
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
              onChange={handleChange}
              value={formData.email}
              error={errors.email}
              placeholder="you@example.com"
            />
          </div>

          {/* Nickname Field */}
          <div>
            <FormLabel required labelTitle={t("nickname")} htmlForTitle="nickname" />
            <FormInput
              type="text"
              icon={<FiUser className="h-5 w-5 text-gray-400" />}
              id="nickname"
              onKeyPress={handleKeyPress}
              name="nickname"
              onChange={handleChange}
              value={formData.nickname}
              error={errors.nickname}
              placeholder="John"
            />
          </div>

          {/* Password Field */}
          <div>
            <FormLabel required labelTitle={t("password")} htmlForTitle="password" />
            <PasswordInput onChange={handleChange} onKeyPress={handleKeyPress} value={formData.password} error={errors.password} />
          </div>

          {/* Submit Button */}
          <FormButton title={t("createAccountButton")} loadingTitle={t("creatingAccount")} handleSubmit={handleSubmit} disabled={isLoading} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {tAuth("alreadyHaveAccount")}{" "}
            <Link href={ROUTE_PATHS.DEFAULT} className="text-blue-600 hover:text-blue-700 font-medium">
              {t("signIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
