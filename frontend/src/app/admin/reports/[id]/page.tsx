"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { reportsApi, Report } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import { ROUTE_PATHS } from "@/routes/paths";
import Loading from "@/components/reuseComponents/Loading";
import { useToast } from "@/contexts/ToastContext";
import { StatusUpdateModal } from "@/components/modals/StatusUpdateModal";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";

export default function AdminReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const { showSuccess, showError } = useToast();
  const reportId = params?.id as string;

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const statusOptions = [
    { value: "PENDING", label: t("statusPending") },
    { value: "REVIEWED", label: t("statusReviewed") },
    { value: "RESOLVED", label: t("statusResolved") },
    { value: "DISMISSED", label: t("statusDismissed") },
  ];

  const fetchReport = async () => {
    if (!reportId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await reportsApi.getById(reportId);
      setReport(data);
    } catch (err: any) {
      console.error("Error fetching report:", err);
      setError(err.message || t("errorLoadingReport"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!reportId) return;
    try {
      setActionLoading(true);
      await reportsApi.update(reportId, { status: newStatus as any });
      showSuccess(t("reportStatusUpdated"));
      setReport((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      setStatusModalOpen(false);
    } catch (err: any) {
      showError(err.message || t("updateReportStatusError"));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reportId) return;
    try {
      setActionLoading(true);
      await reportsApi.delete(reportId);
      showSuccess(t("reportDeleted"));
      router.push(ROUTE_PATHS.ADMIN_REPORTS);
    } catch (err: any) {
      showError(err.message || t("deleteReportError"));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || t("reportNotFound")}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_REPORTS)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t("backToReports")}
          </button>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    REVIEWED: "bg-blue-100 text-blue-800",
    RESOLVED: "bg-green-100 text-green-800",
    DISMISSED: "bg-gray-100 text-gray-800",
  };
  const statusLabels: Record<string, string> = {
    PENDING: t("statusPending"),
    REVIEWED: t("statusReviewed"),
    RESOLVED: t("statusResolved"),
    DISMISSED: t("statusDismissed"),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDetailHeader
        onClick={() => router.push(ROUTE_PATHS.ADMIN_REPORTS)}
        title={t("reportDetails")}
      />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900">{t("reportDetails")}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStatusModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
              >
                {t("updateStatus")}
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                disabled={actionLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 cursor-pointer"
              >
                {t("delete")}
              </button>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">{t("id")}</dt>
              <dd className="mt-1 text-sm text-gray-900 break-all">{report.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t("status")}</dt>
              <dd className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[report.status] || "bg-gray-100 text-gray-800"}`}>
                  {statusLabels[report.status] || report.status}
                </span>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">{t("reason")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.reason}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t("reportedBy")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{report.reportedBy?.nickname || "-"}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">{t("createdAt")}</dt>
              <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(report.createdAt, tTime)}</dd>
            </div>
            {report.post && (
              <>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">{t("post")}</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <button
                      type="button"
                      onClick={() => report.post?.id && router.push(`${ROUTE_PATHS.ADMIN_POSTS}/${report.post!.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      {report.post.title || report.post.id}
                    </button>
                    {report.post.author && (
                      <span className="text-gray-500 ml-2">({t("author")}: {report.post.author.nickname})</span>
                    )}
                  </dd>
                </div>
              </>
            )}
            {report.comment && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">{t("comment")}</dt>
                <dd className="mt-1 text-sm text-gray-900 p-3 bg-gray-50 rounded border border-gray-200">
                  {report.comment.body}
                  {report.comment.author && (
                    <span className="block text-gray-500 mt-1">— {report.comment.author.nickname}</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      <StatusUpdateModal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        onConfirm={handleStatusUpdate}
        title={t("updateReportStatus")}
        currentStatus={report.status}
        statusOptions={statusOptions}
        isLoading={!!actionLoading}
      />

      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteReport")}
        description={t("confirmDeleteReportDescription")}
        confirmText={t("delete")}
        confirmButtonColor="red"
        isLoading={!!actionLoading}
      />
    </div>
  );
}
