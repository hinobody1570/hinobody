"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { boardsApi, Board } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { FaBan, FaCheck, FaPlus, FaTrash, FaEye } from "react-icons/fa";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import StartCommunityPopup from "@/components/modals/StartCommunityPopup";
import { ROUTE_PATHS } from "@/routes/paths";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "delete" | "activate" | "deactivate" | null;

export default function AdminBoardsPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    boardId: string | null;
    boardName: string | null;
  }>({
    isOpen: false,
    action: null,
    boardId: null,
    boardName: null,
  });
  const [isCommunityPopupOpen, setIsCommunityPopupOpen] = useState(false);

  const fetchBoards = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await boardsApi.getAll(1, 20);
        setBoards(response.data);
      } catch (err: any) {
        console.error("Error fetching boards:", err);
        setError(err.message || "Failed to load boards");
      } finally {
        setLoading(false);
      }
  }, []);

  useEffect(() => {
    fetchBoards();
  }, [fetchBoards]);

  const openConfirmationModal = (action: ActionType, boardId: string, boardName: string) => {
    setConfirmationModal({
      isOpen: true,
      action,
      boardId,
      boardName,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      boardId: null,
      boardName: null,
    });
  };

  const handleAction = async () => {
    if (!confirmationModal.boardId || !confirmationModal.action) return;

    const { boardId, action } = confirmationModal;

    try {
      setActionLoading(boardId);

      if (action === "delete") {
        await boardsApi.delete(boardId);
        showSuccess(t("boardDeleted"));
      } else if (action === "activate") {
        await boardsApi.update(boardId, { isActive: true });
        showSuccess(t("boardActivated"));
      } else if (action === "deactivate") {
        await boardsApi.update(boardId, { isActive: false });
        showSuccess(t("boardDeactivated"));
      }

      // Refresh boards list
      const response = await boardsApi.getAll(1, 20);
      setBoards(response.data);

      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing board:`, err);
      const errorKey = action === "delete" ? "deleteBoardError" : action === "activate" ? "activateBoardError" : "deactivateBoardError";
      showError(err.message || t(errorKey));
    } finally {
      setActionLoading(null);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.boardName) return { title: "", description: "" };

    const boardName = confirmationModal.boardName;

    switch (confirmationModal.action) {
      case "delete":
        return {
          title: t("deleteBoard"),
          description: t("confirmDeleteBoardDescription", { name: boardName }),
          confirmText: t("delete"),
          confirmButtonColor: "red" as const,
        };
      case "activate":
        return {
          title: t("activateBoard"),
          description: t("confirmActivateBoardDescription", { name: boardName }),
          confirmText: t("activate"),
          confirmButtonColor: "green" as const,
        };
      case "deactivate":
        return {
          title: t("deactivateBoard"),
          description: t("confirmDeactivateBoardDescription", { name: boardName }),
          confirmText: t("deactivate"),
          confirmButtonColor: "red" as const,
        };
      default:
        return { title: "", description: "" };
    }
  };

  const columns = [
    {
      key: "id",
      header: t("id"),
    },
    {
      key: "name",
      header: t("name"),
      render: (value: string) => <span className="font-semibold">r/{value}</span>,
    },
    {
      key: "category",
      header: t("category"),
      render: (value: any, row: Board) => <span>{row.category?.name || "-"}</span>,
    },
    {
      key: "description",
      header: t("description"),
      render: (value: string) => <span className="max-w-md truncate block">{value || "-"}</span>,
    },
    {
      key: "visibilityAccess",
      header: t("visibility"),
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">{value}</span>
      ),
    },
    {
      key: "isActive",
      header: t("status"),
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
          {value ? t("active") : t("inactive")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value, tTime),
    },
    {
      key: "actions",
      header: "",
      actions: (row: Board) => (
        <div className="flex items-center gap-2">
          {row.isActive ? (
            <button
              onClick={() => openConfirmationModal("deactivate", row.id, row.name)}
              disabled={actionLoading === row.id}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={t("deactivate")}
            >
              <FaBan size={16} />
            </button>
          ) : (
            <button
              onClick={() => openConfirmationModal("activate", row.id, row.name)}
              disabled={actionLoading === row.id}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              title={t("activate")}
            >
              <FaCheck size={16} />
            </button>
          )}
          <button
            onClick={() => openConfirmationModal("delete", row.id, row.name)}
            disabled={actionLoading === row.id}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("delete")}
          >
            <FaTrash size={16} />
          </button>
          <button
            onClick={() => router.push(`${ROUTE_PATHS.ADMIN_BOARDS}/${row.id}`)}
            disabled={actionLoading === row.id}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("viewDetails")}
          >
            <FaEye size={16} />
          </button>
        </div>
      ),
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("boards")}</h1>
        <button
          onClick={() => setIsCommunityPopupOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
        >
          <FaPlus size={18} />
          {t("createCommunity")}
        </button>
      </div>
      <DataTable columns={columns} data={boards} />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleAction}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        confirmButtonColor={modalContent.confirmButtonColor}
        isLoading={actionLoading === confirmationModal.boardId}
      />

      <StartCommunityPopup
        isOpen={isCommunityPopupOpen}
        onClose={() => {
          setIsCommunityPopupOpen(false);
          fetchBoards();
        }}
      />
    </div>
  );
}
