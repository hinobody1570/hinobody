"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/admin/DataTable";
import { postsApi, Post } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { FaBan, FaCheck, FaTrash, FaEye } from "react-icons/fa";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { ROUTE_PATHS } from "@/routes/paths";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "delete" | "activate" | "deactivate" | null;

export default function AdminPostsPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [meta, setMeta] = useState<{ total: number; page: number; limit: number; totalPages: number } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    postId: string | null;
    postTitle: string | null;
  }>({
    isOpen: false,
    action: null,
    postId: null,
    postTitle: null,
  });

  const fetchPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsApi.getAll({ page, limit: 20, includeDeleted: true });
      setPosts(response.data ?? []);
      setMeta(response.meta ?? { total: 0, page, limit: 20, totalPages: 0 });
    } catch (err: any) {
      console.error("Error fetching posts:", err);
      setError(err.message || "Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const openConfirmationModal = (action: ActionType, postId: string, postTitle: string) => {
    setConfirmationModal({
      isOpen: true,
      action,
      postId,
      postTitle,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      postId: null,
      postTitle: null,
    });
  };

  const handleAction = async () => {
    if (!confirmationModal.postId || !confirmationModal.action) return;

    const { postId, action } = confirmationModal;

    try {
      setActionLoading(postId);

      if (action === "delete") {
        await postsApi.delete(postId);
        showSuccess(t("postDeleted"));
      } else if (action === "activate") {
        await postsApi.update(postId, { isActive: true });
        showSuccess(t("postActivated"));
      } else if (action === "deactivate") {
        await postsApi.update(postId, { isActive: false });
        showSuccess(t("postDeactivated"));
      }

      // Refresh posts list (stay on current page)
      const response = await postsApi.getAll({ page: currentPage, limit: 20, includeDeleted: true });
      setPosts(response.data ?? []);
      setMeta(response.meta ?? { total: 0, page: currentPage, limit: 20, totalPages: 0 });

      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing post:`, err);
      const errorKey = action === "delete" ? "deletePostError" : action === "activate" ? "activatePostError" : "deactivatePostError";
      showError(err.message || t(errorKey));
    } finally {
      setActionLoading(null);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.postTitle) return { title: "", description: "" };

    const postTitle = confirmationModal.postTitle;

    switch (confirmationModal.action) {
      case "delete":
        return {
          title: t("deletePost"),
          description: t("confirmDeletePostDescription", { title: postTitle }),
          confirmText: t("delete"),
          confirmButtonColor: "red" as const,
        };
      case "activate":
        return {
          title: t("activatePost"),
          description: t("confirmActivatePostDescription", { title: postTitle }),
          confirmText: t("activate"),
          confirmButtonColor: "green" as const,
        };
      case "deactivate":
        return {
          title: t("deactivatePost"),
          description: t("confirmDeactivatePostDescription", { title: postTitle }),
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
      key: "title",
      header: t("title"),
      render: (value: string) => <span className="max-w-md truncate block">{value}</span>,
    },
    {
      key: "author",
      header: t("author"),
      render: (_: any, row: Post) => row.author?.nickname || "-",
    },
    {
      key: "board",
      header: t("board"),
      render: (_: any, row: Post) => row.board?.name || "-",
    },
    {
      key: "postCategory",
      header: t("category"),
      render: (_: any, row: Post) => row.postCategory || "-",
    },
    {
      key: "upvoteCount",
      header: t("upvotes"),
    },
    {
      key: "commentCount",
      header: t("comments"),
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
      actions: (row: Post) => (
        <div className="flex items-center gap-2">
          {!row.isDeleted &&
            (row.isActive ? (
              <button
                onClick={() => openConfirmationModal("deactivate", row.id, row.title)}
                disabled={actionLoading === row.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={t("deactivate")}
              >
                <FaBan size={16} />
              </button>
            ) : (
              <button
                onClick={() => openConfirmationModal("activate", row.id, row.title)}
                disabled={actionLoading === row.id}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                title={t("activate")}
              >
                <FaCheck size={16} />
              </button>
            ))}
          <button
            onClick={() => openConfirmationModal("delete", row.id, row.title)}
            disabled={actionLoading === row.id || row.isDeleted}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={row.isDeleted ? t("alreadyDeleted") : t("delete")}
          >
            <FaTrash size={16} />
          </button>
          <button
            onClick={() => router.push(`${ROUTE_PATHS.ADMIN_POSTS}/${row.id}`)}
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("posts")}</h1>
      <DataTable
        columns={columns}
        data={posts}
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
        isLoading={actionLoading === confirmationModal.postId}
      />
    </div>
  );
}
