"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function AboutPage() {
  const t = useTranslations("common");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-600 px-4 py-12">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">About Us</h1>

        <div className="prose max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Welcome to HiNobody</h2>
            <p className="text-gray-600 leading-relaxed">
              HiNobody is a progressive web application designed for eye detection and masking using AI technology. Our platform provides advanced
              image processing capabilities while maintaining user privacy and security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Features</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>AI-powered eye detection and masking</li>
              <li>Real-time image processing</li>
              <li>Multi-language support (English, Korean, Chinese, Japanese)</li>
              <li>Secure authentication system</li>
              <li>Responsive design for all devices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Technology Stack</h2>
            <p className="text-gray-600 leading-relaxed">
              Built with Next.js, React, TypeScript, and TensorFlow.js for cutting-edge AI capabilities. Our backend uses NestJS with Prisma for
              robust data management.
            </p>
          </section>

          <section className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-700 mb-3">Contact</h2>
            <p className="text-gray-600">For inquiries or support, please contact us through the application.</p>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="inline-block bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
