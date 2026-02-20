"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { commentsApi, Comment } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { FaTrash, FaEye } from "react-icons/fa";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { ROUTE_PATHS } from "@/routes/paths";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "delete" | null;

export default function AdminCommentsPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    commentId: string | null;
    commentBody: string | null;
  }>({
    isOpen: false,
    action: null,
    commentId: null,
    commentBody: null,
  });

  const fetchComments = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await commentsApi.getAllAdmin({ page, limit: 20 });
      setComments(response.data ?? []);
      setMeta(response.meta ?? { total: 0, page, limit: 20, totalPages: 0 });
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      setError(err.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  const openConfirmationModal = (action: ActionType, commentId: string, commentBody: string) => {
    setConfirmationModal({
      isOpen: true,
      action,
      commentId,
      commentBody,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      commentId: null,
      commentBody: null,
    });
  };

  const handleAction = async () => {
    if (!confirmationModal.commentId || !confirmationModal.action) return;

    const { commentId, action } = confirmationModal;

    try {
      setActionLoading(commentId);

      if (action === "delete") {
        await commentsApi.delete(commentId);
        showSuccess(t("commentDeleted"));
      }

      const response = await commentsApi.getAllAdmin({ page: currentPage, limit: 20 });
      setComments(response.data ?? []);
      setMeta(response.meta ?? { total: 0, page: currentPage, limit: 20, totalPages: 0 });

      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing comment:`, err);
      showError(err.message || t("deleteCommentError"));
    } finally {
      setActionLoading(null);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.commentBody) return { title: "", description: "" };

    const bodyPreview = confirmationModal.commentBody.length > 50
      ? confirmationModal.commentBody.substring(0, 50) + "..."
      : confirmationModal.commentBody;

    switch (confirmationModal.action) {
      case "delete":
        return {
          title: t("deleteComment"),
          description: t("confirmDeleteCommentDescription", { body: bodyPreview }),
          confirmText: t("delete"),
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
      render: (value: string) => <span className="max-w-[80px] truncate block">{value}</span>,
    },
    {
      key: "body",
      header: t("body"),
      render: (value: string) => <span className="max-w-xs truncate block" title={value}>{value || "-"}</span>,
    },
    {
      key: "author",
      header: t("author"),
      render: (_: any, row: Comment) => row.author?.nickname || "-",
    },
    {
      key: "post",
      header: t("post"),
      render: (_: any, row: Comment) => (
        <span
          className="max-w-xs truncate block text-blue-600 hover:underline cursor-pointer"
          onClick={() => row.post?.id && router.push(`${ROUTE_PATHS.ADMIN_POSTS}/${row.post.id}`)}
          title={row.post?.title}
        >
          {row.post?.title || "-"}
        </span>
      ),
    },
    {
      key: "upvoteCount",
      header: t("upvotes"),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value, tTime),
    },
    {
      key: "actions",
      header: "",
      actions: (row: Comment) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => row.post?.id && router.push(`${ROUTE_PATHS.ADMIN_POSTS}/${row.post.id}`)}
            disabled={actionLoading === row.id}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("viewDetails")}
          >
            <FaEye size={16} />
          </button>
          <button
            onClick={() => openConfirmationModal("delete", row.id, row.body)}
            disabled={actionLoading === row.id}
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
    return <ErrorSection error={error} />;
  }

  const modalContent = getModalContent();

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("comments")}</h1>
      <DataTable
        columns={columns}
        data={comments}
        itemsPerPage={20}
        totalCount={meta?.total}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleAction}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        confirmButtonColor={modalContent.confirmButtonColor}
        isLoading={actionLoading === confirmationModal.commentId}
      />
    </div>
  );
}
