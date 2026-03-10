"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Loading from "@/components/reuseComponents/Loading";
import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import { ROUTE_PATHS } from "@/routes/paths";
import { contactSubmissionsApi, type ContactSubmissionDto } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";

export default function AdminContactSubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const id = params?.id as string;

  const [item, setItem] = useState<ContactSubmissionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const res = await contactSubmissionsApi.getById(id);
        setItem(res);
      } catch (err: any) {
        console.error("Error fetching contact submission:", err);
        setError(err?.message || t("errorLoadingContactSubmission"));
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id, t]);

  if (loading) return <Loading />;

  if (error || !item) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || t("contactSubmissionNotFound")}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_CONTACT_SUBMISSIONS)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t("backToContactSubmissions")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDetailHeader
        onClick={() => router.push(ROUTE_PATHS.ADMIN_CONTACT_SUBMISSIONS)}
        title={t("contactSubmissionDetails")}
      />

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t("id")}</dt>
              <dd className="mt-1 text-sm text-gray-900 break-all">{item.id}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("name")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.name}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("email")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.email}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("category")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.category}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("subject")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.subject}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("status")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.status}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("priority")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{item.priority}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("createdAt")}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {formatTimestamp(item.createdAt, tTime)}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">{t("resolvedAt")}</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {item.resolvedAt ? formatTimestamp(item.resolvedAt, tTime) : "-"}
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t("message")}</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap p-3 bg-gray-50 rounded border border-gray-200">
                {item.message}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

