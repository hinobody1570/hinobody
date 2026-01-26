"use client";

import { DataTable } from "@/components/admin/DataTable";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import Loading from "@/components/reuseComponents/Loading";
import { useToast } from "@/contexts/ToastContext";
import { User, usersApi } from "@/lib/api";
import { ROUTE_PATHS } from "@/routes/paths";
import { formatTimestamp } from "@/utils/helperFunction";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaBan, FaCheck, FaEye, FaTrash } from "react-icons/fa";
import DP from "../../../../public/assets/images/avatar_default_4.png";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "block" | "unblock" | "delete" | null;

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const router = useRouter();
  const { showSuccess, showError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    userId: string | null;
    userName: string | null;
  }>({
    isOpen: false,
    action: null,
    userId: null,
    userName: null,
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await usersApi.getAll(1, 20); // Get all users
        setUsers(response.data);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const openConfirmationModal = (action: ActionType, userId: string, userName: string) => {
    // Do not allow block/unblock/delete actions for ADMIN users
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role?.toUpperCase?.() === "ADMIN") return;

    setConfirmationModal({
      isOpen: true,
      action,
      userId,
      userName,
    });
  };

  const closeConfirmationModal = () => {
    if (actionLoading) return; // Prevent closing while action is in progress
    setConfirmationModal({
      isOpen: false,
      action: null,
      userId: null,
      userName: null,
    });
  };

  const handleConfirm = async () => {
    if (!confirmationModal.userId || !confirmationModal.action) return;

    const { userId, action } = confirmationModal;

    try {
      setActionLoading(userId);

      switch (action) {
        case "block":
          await usersApi.block(userId);
          showSuccess(t("userBlocked"));
          break;
        case "unblock":
          await usersApi.unblock(userId);
          showSuccess(t("userUnblocked"));
          break;
        case "delete":
          await usersApi.delete(userId);
          showSuccess(t("userDeleted"));
          break;
      }

      // Refresh users list
      const response = await usersApi.getAll(1, 20);
      setUsers(response.data);

      // Close modal
      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      const errorKey = action === "block" ? "blockError" : action === "unblock" ? "unblockError" : "deleteError";
      showError(err.message || t(errorKey));
    } finally {
      setActionLoading(null);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.userName) return { title: "", description: "" };

    const userName = confirmationModal.userName;

    switch (confirmationModal.action) {
      case "block":
        return {
          title: t("blockUser"),
          description: t("confirmBlockDescription", { name: userName }),
          confirmText: t("block"),
          confirmButtonColor: "red" as const,
        };
      case "unblock":
        return {
          title: t("unblockUser"),
          description: t("confirmUnblockDescription", { name: userName }),
          confirmText: t("unblock"),
          confirmButtonColor: "green" as const,
        };
      case "delete":
        return {
          title: t("deleteUser"),
          description: t("confirmDeleteDescription", { name: userName }),
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
    },
    {
      key: "avatar",
      header: t("avatar"),
      render: (value: string) => (
        <div>
          <Image src={value ? value : DP} alt="DP" width={80} height={80} className="rounded-full" />
        </div>
      ),
    },
    {
      key: "nickname",
      header: t("nickname"),
    },
    {
      key: "email",
      header: t("email"),
    },
    {
      key: "role",
      header: t("role"),
      render: (value: string) => <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">{value}</span>,
    },
    // {
    //   key: "language",
    //   header: t("language"),
    //   render: (value: string) => <span className="uppercase">{value}</span>,
    // },
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
      key: "provider",
      header: "Provider",
      render: (value: string) => <span className="capitalize">{value}</span>,
    },
    {
      key: "emailVerified",
      header: t("emailVerified"),
      render: (value: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${value ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
          {value ? t("verified") : t("nonVerified")}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value),
    },
    {
      key: "actions",
      header: "",
      actions: (row: User) => (
        <div className="flex items-center gap-2">
          {(() => {
            const isAdminUser = row.role?.toUpperCase?.() === "ADMIN";
            const isBusy = actionLoading === row.id;
            const isDisabled = isAdminUser || isBusy;

            return (
              <>
                {row.isActive ? (
                  <button
                    onClick={() => openConfirmationModal("block", row.id, row.nickname || row.email)}
                    disabled={isDisabled}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title={t("block")}
                  >
                    <FaBan size={16} />
                  </button>
                ) : (
                  <button
                    onClick={() => openConfirmationModal("unblock", row.id, row.nickname || row.email)}
                    disabled={isDisabled}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title={t("unblock")}
                  >
                    <FaCheck size={16} />
                  </button>
                )}
                <button
                  onClick={() => openConfirmationModal("delete", row.id, row.nickname || row.email)}
                  disabled={isDisabled}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={t("delete")}
                >
                  <FaTrash size={16} />
                </button>
                <button
                  onClick={() => router.push(`${ROUTE_PATHS.ADMIN_USER_DETAIL}/${row.id}`)}
                  disabled={isBusy}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  title={t("viewDetails")}
                >
                  <FaEye size={16} />
                </button>
              </>
            );
          })()}
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("users")}</h1>
      <DataTable columns={columns} data={users} />

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
