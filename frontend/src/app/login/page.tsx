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

interface loginFormType {
  email?: string;
  password?: string;
}

type LoginFormErrors = Partial<Record<keyof loginFormType, string>>;

export default function LoginForm() {
  const [formData, setFormData] = useState<loginFormType>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: LoginFormErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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

    // Simulate API call
    setTimeout(() => {
      console.log("Login submitted:", { ...formData, rememberMe });
      setIsLoading(false);
      setIsLoggedIn(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsLoggedIn(false);
        setFormData({ email: "", password: "" });
        setRememberMe(false);
      }, 3000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (isLoggedIn) {
    return <ConfirmationMessage message="You have successfully logged in to your account." title="Welcome Back!" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to continue to your account</p>
        </div>

        <div className="space-y-6">
          {/* Email Field */}
          <div>
            <FormLabel labelTitle="Email Address" htmlForTitle="email" />
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
            <FormLabel labelTitle="Password" htmlForTitle="password" />
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
                Remember me
              </label>
            </div>
            <Link href={ROUTE_PATHS.FORGOT_PASSWORD} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <FormButton title="Sign In" loadingTitle="Signing In..." handleSubmit={handleSubmit} disabled={isLoading} />

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href={ROUTE_PATHS.REGISTER} className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
