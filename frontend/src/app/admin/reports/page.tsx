"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { reportsApi, Report } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { StatusUpdateModal } from "@/components/modals/StatusUpdateModal";
import { FaEdit, FaTrash } from "react-icons/fa";
import Loading from "@/components/reuseComponents/Loading";

export default function AdminReportsPage() {
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const { showSuccess, showError } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    reportId: string | null;
    currentStatus: string;
  }>({
    isOpen: false,
    reportId: null,
    currentStatus: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    reportId: string | null;
  }>({
    isOpen: false,
    reportId: null,
  });

  const statusOptions = [
    { value: "PENDING", label: t("statusPending") },
    { value: "REVIEWED", label: t("statusReviewed") },
    { value: "RESOLVED", label: t("statusResolved") },
    { value: "DISMISSED", label: t("statusDismissed") },
  ];

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await reportsApi.getAll(1, 20);
        setReports(response.data);
      } catch (err: any) {
        console.error("Error fetching reports:", err);
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const openStatusModal = (reportId: string, currentStatus: string) => {
    setStatusModal({
      isOpen: true,
      reportId,
      currentStatus,
    });
  };

  const closeStatusModal = () => {
    if (actionLoading) return;
    setStatusModal({
      isOpen: false,
      reportId: null,
      currentStatus: "",
    });
  };

  const openDeleteModal = (reportId: string) => {
    setDeleteModal({
      isOpen: true,
      reportId,
    });
  };

  const closeDeleteModal = () => {
    if (actionLoading) return;
    setDeleteModal({
      isOpen: false,
      reportId: null,
    });
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!statusModal.reportId) return;

    try {
      setActionLoading(statusModal.reportId);
      await reportsApi.update(statusModal.reportId, { status: newStatus as any });
      showSuccess(t("reportStatusUpdated"));

      // Refresh reports list
      const response = await reportsApi.getAll(1, 20);
      setReports(response.data);

      closeStatusModal();
    } catch (err: any) {
      console.error("Error updating report status:", err);
      showError(err.message || t("updateReportStatusError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.reportId) return;

    try {
      setActionLoading(deleteModal.reportId);
      await reportsApi.delete(deleteModal.reportId);
      showSuccess(t("reportDeleted"));

      // Refresh reports list
      const response = await reportsApi.getAll(1, 20);
      setReports(response.data);

      closeDeleteModal();
    } catch (err: any) {
      console.error("Error deleting report:", err);
      showError(err.message || t("deleteReportError"));
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "id",
      header: t("id"),
    },
    {
      key: "reason",
      header: t("reason"),
    },
    {
      key: "status",
      header: t("status"),
      render: (value: string) => {
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
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[value] || "bg-gray-100 text-gray-800"}`}>
            {statusLabels[value] || value}
          </span>
        );
      },
    },
    {
      key: "reportedBy",
      header: t("reportedBy"),
      render: (value: any) => (value ? value.nickname : "-"),
    },
    {
      key: "post",
      header: t("post"),
      render: (value: any) => (value ? value.title : "-"),
    },
    {
      key: "comment",
      header: t("comment"),
      render: (value: any) => (value ? value.body?.substring(0, 50) + "..." : "-"),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value),
    },
    {
      key: "actions",
      header: "",
      actions: (row: Report) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openStatusModal(row.id, row.status)}
            disabled={!!actionLoading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("updateStatus")}
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => openDeleteModal(row.id)}
            disabled={!!actionLoading}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("delete")}
          >
            <FaTrash size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("reports")}</h1>
      <DataTable columns={columns} data={reports} />

      <StatusUpdateModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        onConfirm={handleStatusUpdate}
        title={t("updateReportStatus")}
        currentStatus={statusModal.currentStatus}
        statusOptions={statusOptions}
        isLoading={!!actionLoading}
      />

      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
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
