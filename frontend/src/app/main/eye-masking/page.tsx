"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";

// Loading component for dynamic import
const LoadingComponent = () => {
  const t = useTranslations("eyeMasking");
  return (
    <div className="flex items-center justify-center p-24">
      <p>{t("loadingTool")}</p>
    </div>
  );
};

// Dynamically import the component to prevent SSR issues with MediaPipe/TensorFlow
const EyeMaskingForm = dynamic(() => import("@/components/EyeMaskingForm"), {
  ssr: false,
  loading: LoadingComponent,
});

const styleContainer = {
//   background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
};

export default function Eye_masking() {
  const t = useTranslations("common");
  const router = useRouter();

  return (
    <main className="min-h-screen" style={styleContainer}>
      <div className="container mx-auto">
        <EyeMaskingForm />
      </div>
    </main>
  );
}
