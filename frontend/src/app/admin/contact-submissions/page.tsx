"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";
import { DataTable } from "@/components/admin/DataTable";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { StatusUpdateModal } from "@/components/modals/StatusUpdateModal";
import { useToast } from "@/contexts/ToastContext";
import { ROUTE_PATHS } from "@/routes/paths";
import { formatTimestamp } from "@/utils/helperFunction";
import {
  contactSubmissionsApi,
  type ContactSubmissionDto,
  type ContactSubmissionPriority,
  type ContactSubmissionStatus,
} from "@/lib/api";

type ModalState =
  | { type: "none" }
  | { type: "status"; id: string; current: ContactSubmissionStatus }
  | { type: "priority"; id: string; current: ContactSubmissionPriority }
  | { type: "delete"; id: string };

export default function AdminContactSubmissionsPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<ContactSubmissionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPage = async (nextPage: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await contactSubmissionsApi.getAll(nextPage, 20);
      setItems(res.data);
      setTotal(res.meta.total);
      setPage(res.meta.page);
    } catch (err: any) {
      console.error("Error fetching contact submissions:", err);
      setError(err?.message || t("errorLoadingContactSubmissions"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage(1);
  }, []);

  const statusOptions = useMemo(
    () => [
      { value: "PENDING", label: t("statusPending") },
      { value: "IN_PROGRESS", label: t("statusInProgress") },
      { value: "RESOLVED", label: t("statusResolved") },
      { value: "CLOSED", label: t("statusClosed") },
    ],
    [t],
  );

  const priorityOptions = useMemo(
    () => [
      { value: "LOW", label: t("priorityLow") },
      { value: "NORMAL", label: t("priorityNormal") },
      { value: "HIGH", label: t("priorityHigh") },
      { value: "CRITICAL", label: t("priorityCritical") },
    ],
    [t],
  );

  const statusPill = (value: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      PENDING: t("statusPending"),
      IN_PROGRESS: t("statusInProgress"),
      RESOLVED: t("statusResolved"),
      CLOSED: t("statusClosed"),
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[value] || "bg-gray-100 text-gray-800"}`}>
        {labels[value] || value}
      </span>
    );
  };

  const priorityPill = (value: string) => {
    const colors: Record<string, string> = {
      LOW: "bg-gray-100 text-gray-800",
      NORMAL: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      CRITICAL: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      LOW: t("priorityLow"),
      NORMAL: t("priorityNormal"),
      HIGH: t("priorityHigh"),
      CRITICAL: t("priorityCritical"),
    };
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[value] || "bg-gray-100 text-gray-800"}`}>
        {labels[value] || value}
      </span>
    );
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (modal.type !== "status") return;
    const id = modal.id;
    try {
      setActionLoading(id);
      await contactSubmissionsApi.update(id, { status: newStatus as any });
      showSuccess(t("contactSubmissionUpdated"));
      await fetchPage(page);
      setModal({ type: "none" });
    } catch (err: any) {
      console.error("Error updating contact submission:", err);
      showError(err?.message || t("updateContactSubmissionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdatePriority = async (newPriority: string) => {
    if (modal.type !== "priority") return;
    const id = modal.id;
    try {
      setActionLoading(id);
      await contactSubmissionsApi.update(id, { priority: newPriority as any });
      showSuccess(t("contactSubmissionUpdated"));
      await fetchPage(page);
      setModal({ type: "none" });
    } catch (err: any) {
      console.error("Error updating contact submission:", err);
      showError(err?.message || t("updateContactSubmissionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async () => {
    if (modal.type !== "delete") return;
    const id = modal.id;
    try {
      setActionLoading(id);
      await contactSubmissionsApi.delete(id);
      showSuccess(t("contactSubmissionDeleted"));
      await fetchPage(1);
      setModal({ type: "none" });
    } catch (err: any) {
      console.error("Error deleting contact submission:", err);
      showError(err?.message || t("deleteContactSubmissionError"));
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    { key: "name", header: t("name") },
    { key: "email", header: t("email") },
    { key: "category", header: t("category") },
    { key: "subject", header: t("subject") },
    {
      key: "message",
      header: t("message"),
      render: (value: string) => (value ? `${value.slice(0, 60)}${value.length > 60 ? "..." : ""}` : "-"),
    },
    {
      key: "status",
      header: t("status"),
      render: (value: string) => statusPill(value),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value, tTime),
    },
    {
      key: "actions",
      header: "",
      actions: (row: ContactSubmissionDto) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`${ROUTE_PATHS.ADMIN_CONTACT_SUBMISSIONS}/${row.id}`)}
            disabled={!!actionLoading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("viewDetails")}
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => setModal({ type: "status", id: row.id, current: row.status })}
            disabled={!!actionLoading}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("updateStatus")}
          >
            <FaEdit size={16} />
          </button>
          <button
            onClick={() => setModal({ type: "delete", id: row.id })}
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

  if (loading) return <Loading />;
  if (error) return <ErrorSection error={error} />;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("contactSubmissions")}</h1>
      <DataTable
        columns={columns as any}
        data={items}
        pagination
        itemsPerPage={20}
        totalCount={total}
        currentPage={page}
        onPageChange={(p) => fetchPage(p)}
      />

      <StatusUpdateModal
        isOpen={modal.type === "status"}
        onClose={() => (actionLoading ? null : setModal({ type: "none" }))}
        onConfirm={handleUpdateStatus}
        title={t("updateStatus")}
        currentStatus={modal.type === "status" ? modal.current : ""}
        statusOptions={statusOptions}
        isLoading={!!actionLoading}
      />

      <StatusUpdateModal
        isOpen={modal.type === "priority"}
        onClose={() => (actionLoading ? null : setModal({ type: "none" }))}
        onConfirm={handleUpdatePriority}
        title={t("updatePriority")}
        currentStatus={modal.type === "priority" ? modal.current : ""}
        statusOptions={priorityOptions}
        isLoading={!!actionLoading}
      />

      <ConfirmationModal
        isOpen={modal.type === "delete"}
        onClose={() => (actionLoading ? null : setModal({ type: "none" }))}
        onConfirm={handleDelete}
        title={t("deleteContactSubmission")}
        description={t("confirmDeleteContactSubmissionDescription")}
        confirmText={t("delete")}
        confirmButtonColor="red"
        isLoading={!!actionLoading}
      />
    </div>
  );
}

