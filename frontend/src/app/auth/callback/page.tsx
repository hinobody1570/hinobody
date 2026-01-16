"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/contexts/ToastContext";
import { ROUTE_PATHS } from "@/routes/paths";
import { useTranslations } from "next-intl";
import { setAuth } from "@/lib/auth";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useToast();
  const t = useTranslations("auth");
  const tToast = useTranslations("toast");
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam));
        setAuth(token, user);
        showSuccess(tToast("loginSuccess"));
        // Reload the page to update auth context
        window.location.href = ROUTE_PATHS.HOME;
      } catch (error) {
        console.error("Error parsing user data:", error);
        showError(tToast("loginError"));
        router.push(ROUTE_PATHS.LOGIN);
      }
    } else {
      showError(tToast("loginError"));
      router.push(ROUTE_PATHS.LOGIN);
    }
    setIsProcessing(false);
  }, [searchParams, router, showSuccess, showError, tToast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{isProcessing ? t("processing") : "Redirecting..."}</p>
      </div>
    </div>
  );
}

