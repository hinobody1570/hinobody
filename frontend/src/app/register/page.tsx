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

interface SignUpFormType {
  email?: string;
  nickname?: string;
  password?: string;
}

type SignUpFormErrors = Partial<Record<keyof SignUpFormType, string>>;

export default function SignupForm() {
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
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.nickname) {
      newErrors.nickname = "Nickname is required";
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = "Nickname must be at least 3 characters";
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
      console.log("Form submitted:", formData);
      setIsLoading(false);
      setIsSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ email: "", nickname: "", password: "" });
      }, 3000);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  if (isSubmitted) {
    return (
      <ConfirmationMessage message={`Welcome aboard, ${formData.nickname}! Your account has been successfully created`} title="Account Created!" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-600">Join us today and get started</p>
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

          {/* Nickname Field */}
          <div>
            <FormLabel labelTitle="Nickname" htmlForTitle="nickname" />
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
            <FormLabel labelTitle="Password" htmlForTitle="password" />
            <PasswordInput onChange={handleChange} onKeyPress={handleKeyPress} value={formData.password} error={errors.password} />
          </div>

          {/* Submit Button */}
          <FormButton title="Create Account" loadingTitle="Creating Account..." handleSubmit={handleSubmit} disabled={isLoading} />
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href={ROUTE_PATHS.LOGIN} className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
