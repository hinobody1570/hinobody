"use client";

import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRouter } from "next/navigation";
import { ROUTE_PATHS } from "@/routes/paths";

// Loading component for dynamic import
const LoadingComponent = () => {
  const t = useTranslations('eyeMasking');
  return (
    <div className="flex items-center justify-center p-24">
      <p>{t('loadingTool')}</p>
    </div>
  );
};

// Dynamically import the component to prevent SSR issues with MediaPipe/TensorFlow
const EyeMaskingForm = dynamic(() => import("@/components/EyeMaskingForm"), {
  ssr: false,
  loading: LoadingComponent,
});

const styleContainer = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
}

export default function Home() {
  const t = useTranslations('common');
  const router = useRouter()

  return (
    <main className="min-h-screen" style={styleContainer}>
      <div className="container px-4 py-6 mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-bold">{t('welcome')}</h1>
            <p className="text-lg mt-2">{t('description')}</p>
          </div>
          <div className="flex gap-4">
          <button className="p-2 rounded-xl bg-white text-black text-lg cursor-pointer" onClick={()=> router.push(ROUTE_PATHS.HOME)}>Home</button>
          <LanguageSwitcher />
          </div>
        </div>
        <EyeMaskingForm />
      </div>  
    </main>
  );
}
