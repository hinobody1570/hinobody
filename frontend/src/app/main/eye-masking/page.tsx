"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// Loading component for dynamic import
const LoadingComponent = () => {
  const t = useTranslations("eyeMasking");
  return (
    <div className="flex items-center justify-center py-12 sm:py-24 px-4">
      <p className="text-sm sm:text-base">{t("loadingTool")}</p>
    </div>
  );
};

// Dynamically import the component to prevent SSR issues with MediaPipe/TensorFlow
const EyeMaskingForm = dynamic(() => import("@/components/EyeMaskingForm"), {
  ssr: false,
  loading: LoadingComponent,
});

export default function Eye_masking() {
  return (
    <main className="min-h-screen w-full">
      <div className="container mx-auto w-full max-w-4xl px-3 sm:px-4 md:px-6 py-4 sm:py-6">
        <EyeMaskingForm />
      </div>
    </main>
  );
}
