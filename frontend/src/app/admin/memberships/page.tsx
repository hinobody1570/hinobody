"use client";

import { DataTable } from "@/components/admin/DataTable";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import Loading from "@/components/reuseComponents/Loading";
import { useToast } from "@/contexts/ToastContext";
import { BoardMembership, boardsApi } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaTrash, FaEye } from "react-icons/fa";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "approve" | "reject" | "delete" | null;

export default function AdminMembershipsPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [memberships, setMemberships] = useState<BoardMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    membership: BoardMembership | null;
  }>({
    isOpen: false,
    action: null,
    membership: null,
  });

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await boardsApi.getAllMemberships();
        setMemberships(data);
      } catch (err: any) {
        console.error("Error fetching memberships:", err);
        setError(err.message || "Failed to load memberships");
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  const openConfirmationModal = (action: ActionType, membership: BoardMembership) => {
    setConfirmationModal({
      isOpen: true,
      action,
      membership,
    });
  };

  const closeConfirmationModal = () => {
    if (actionLoading) return;
    setConfirmationModal({
      isOpen: false,
      action: null,
      membership: null,
    });
  };

  const handleConfirm = async () => {
    if (!confirmationModal.membership || !confirmationModal.action) return;

    const { membership, action } = confirmationModal;
    const actionKey = `${membership.boardId}-${membership.userId}`;

    try {
      setActionLoading(actionKey);

      switch (action) {
        case "approve":
          await boardsApi.approveMembershipAdmin(membership.boardId, membership.userId);
          showSuccess(t("membershipApproved") || "Membership approved successfully");
          break;
        case "reject":
          await boardsApi.rejectMembershipAdmin(membership.boardId, membership.userId);
          showSuccess(t("membershipRejected") || "Membership rejected successfully");
          break;
        case "delete":
          await boardsApi.deleteMembershipAdmin(membership.boardId, membership.userId);
          showSuccess(t("membershipDeleted") || "Membership deleted successfully");
          break;
      }

      // Refresh memberships list
      const data = await boardsApi.getAllMemberships();
      setMemberships(data);

      // Close modal
      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing membership:`, err);
      showError(err.message || `Failed to ${action} membership`);
    } finally {
      setActionLoading(null);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.membership) return { title: "", description: "" };

    const membership = confirmationModal.membership;
    const userName = membership.user?.nickname || membership.user?.email || "User";
    const boardName = membership.board?.name || "Board";

    switch (confirmationModal.action) {
      case "approve":
        return {
          title: t("approveMembership") || "Approve Membership",
          description: t("confirmApproveMembership", { name: userName, board: boardName }) || `Are you sure you want to approve ${userName}'s membership request for ${boardName}?`,
          confirmText: t("approve") || "Approve",
          confirmButtonColor: "green" as const,
        };
      case "reject":
        return {
          title: t("rejectMembership") || "Reject Membership",
          description: t("confirmRejectMembership", { name: userName, board: boardName }) || `Are you sure you want to reject ${userName}'s membership request for ${boardName}?`,
          confirmText: t("reject") || "Reject",
          confirmButtonColor: "red" as const,
        };
      case "delete":
        return {
          title: t("deleteMembership") || "Delete Membership",
          description: t("confirmDeleteMembership", { name: userName, board: boardName }) || `Are you sure you want to delete ${userName}'s membership from ${boardName}? This action cannot be undone.`,
          confirmText: t("delete"),
          confirmButtonColor: "red" as const,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: "bg-yellow-100", text: "text-yellow-800" },
      APPROVED: { bg: "bg-green-100", text: "text-green-800" },
      REJECTED: { bg: "bg-red-100", text: "text-red-800" },
    };

    const colors = statusColors[status] || { bg: "bg-gray-100", text: "text-gray-800" };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors.bg} ${colors.text}`}>
        {status}
      </span>
    );
  };

  const columns = [
    {
      key: "user",
      header: t("user") || "User",
      render: (value: BoardMembership["user"]) => (
        <div className="flex flex-col">
          <span className="font-semibold">{value?.nickname || "Unknown"}</span>
          {value?.email && <span className="text-xs text-gray-500">{value.email}</span>}
        </div>
      ),
    },
    {
      key: "board",
      header: t("board") || "Board",
      render: (value: BoardMembership["board"]) => (
        <div className="flex flex-col">
          <span className="font-semibold">r/{value?.name || "Unknown"}</span>
          {value?.visibilityAccess && (
            <span className="text-xs text-gray-500 capitalize">{value.visibilityAccess.toLowerCase()}</span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: t("status") || "Status",
      render: (value: string) => getStatusBadge(value),
    },
    {
      key: "createdAt",
      header: t("createdAt") || "Requested At",
      render: (value: string) => formatTimestamp(value, tTime),
    },
    {
      key: "actions",
      header: "",
      actions: (row: BoardMembership) => {
        const actionKey = `${row.boardId}-${row.userId}`;
        const isBusy = actionLoading === actionKey;

        return (
          <div className="flex items-center gap-2">
            {row.status === "PENDING" && (
              <>
                <button
                  onClick={() => openConfirmationModal("approve", row)}
                  disabled={isBusy}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={t("approve") || "Approve"}
                >
                  <FaCheck size={16} />
                </button>
                <button
                  onClick={() => openConfirmationModal("reject", row)}
                  disabled={isBusy}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={t("reject") || "Reject"}
                >
                  <FaTimes size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => openConfirmationModal("delete", row)}
              disabled={isBusy}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={t("delete")}
            >
              <FaTrash size={16} />
            </button>
            {/* <button
              onClick={() => router.push(`/main/board/${row.boardId}`)}
              disabled={isBusy}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={t("viewDetails")}
            >
              <FaEye size={16} />
            </button> */}
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <ErrorSection error={error} />;
  }

  const modalContent = getModalContent();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("memberships") || "Memberships"}</h1>
      <DataTable columns={columns} data={memberships} />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleConfirm}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        confirmButtonColor={modalContent.confirmButtonColor}
        isLoading={!!actionLoading}
      />
    </div>
  );
}
