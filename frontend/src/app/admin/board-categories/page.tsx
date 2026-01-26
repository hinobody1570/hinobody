"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { boardCategoriesApi, BoardCategory } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { FaBan, FaCheck, FaTrash, FaEdit } from "react-icons/fa";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import { BoardCategoryModal } from "@/components/modals/BoardCategoryModal";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

type ActionType = "delete" | "activate" | "deactivate" | null;

export default function AdminBoardCategoriesPage() {
  const t = useTranslations("admin");
  const { showSuccess, showError } = useToast();
  const [categories, setCategories] = useState<BoardCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    action: ActionType;
    categoryId: string | null;
    categoryName: string | null;
  }>({
    isOpen: false,
    action: null,
    categoryId: null,
    categoryName: null,
  });
  const [categoryModal, setCategoryModal] = useState<{
    isOpen: boolean;
    category: BoardCategory | null;
  }>({
    isOpen: false,
    category: null,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await boardCategoriesApi.getAll(1, 100);
      setCategories(response.data);
    } catch (err: any) {
      console.error("Error fetching categories:", err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const openConfirmationModal = (action: ActionType, categoryId: string, categoryName: string) => {
    setConfirmationModal({
      isOpen: true,
      action,
      categoryId,
      categoryName,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      action: null,
      categoryId: null,
      categoryName: null,
    });
  };

  const openCategoryModal = (category?: BoardCategory) => {
    setCategoryModal({
      isOpen: true,
      category: category || null,
    });
  };

  const closeCategoryModal = () => {
    setCategoryModal({
      isOpen: false,
      category: null,
    });
  };

  const handleAction = async () => {
    if (!confirmationModal.categoryId || !confirmationModal.action) return;

    const { categoryId, action } = confirmationModal;

    try {
      setActionLoading(categoryId);

      if (action === "delete") {
        await boardCategoriesApi.delete(categoryId);
        showSuccess(t("categoryDeleted"));
      } else if (action === "activate") {
        await boardCategoriesApi.update(categoryId, { active: true });
        showSuccess(t("categoryActivated"));
      } else if (action === "deactivate") {
        await boardCategoriesApi.update(categoryId, { active: false });
        showSuccess(t("categoryDeactivated"));
      }

      await fetchCategories();
      closeConfirmationModal();
    } catch (err: any) {
      console.error(`Error ${action}ing category:`, err);
      const errorKey = action === "delete" ? "deleteCategoryError" : action === "activate" ? "activateCategoryError" : "deactivateCategoryError";
      showError(err.message || t(errorKey));
    } finally {
      setActionLoading(null);
    }
  };

  const handleSave = async (data: { name: string; active?: boolean }) => {
    try {
      setSaveLoading(true);
      if (categoryModal.category) {
        await boardCategoriesApi.update(categoryModal.category.id, data);
        showSuccess(t("categoryUpdated"));
      } else {
        await boardCategoriesApi.create(data);
        showSuccess(t("categoryCreated"));
      }
      await fetchCategories();
      closeCategoryModal();
    } catch (err: any) {
      console.error("Error saving category:", err);
      showError(err.message || t("saveCategoryError"));
      throw err;
    } finally {
      setSaveLoading(false);
    }
  };

  const getModalContent = () => {
    if (!confirmationModal.action || !confirmationModal.categoryName) return { title: "", description: "" };

    const categoryName = confirmationModal.categoryName;

    switch (confirmationModal.action) {
      case "delete":
        return {
          title: t("deleteCategory"),
          description: t("confirmDeleteCategoryDescription", { name: categoryName }),
          confirmText: t("delete"),
          confirmButtonColor: "red" as const,
        };
      case "activate":
        return {
          title: t("activateCategory"),
          description: t("confirmActivateCategoryDescription", { name: categoryName }),
          confirmText: t("activate"),
          confirmButtonColor: "green" as const,
        };
      case "deactivate":
        return {
          title: t("deactivateCategory"),
          description: t("confirmDeactivateCategoryDescription", { name: categoryName }),
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
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: "active",
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
      render: (value: string) => formatTimestamp(value),
    },
    {
      key: "updatedAt",
      header: t("updatedAt"),
      render: (value: string) => formatTimestamp(value),
    },
    {
      key: "actions",
      header: "",
      actions: (row: BoardCategory) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openCategoryModal(row)}
            disabled={actionLoading === row.id}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            title={t("edit")}
          >
            <FaEdit size={16} />
          </button>
          {row.active ? (
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t("boardCategories")}</h1>
        <button
          onClick={() => openCategoryModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
        >
          {t("addNew")}
        </button>
      </div>
      <DataTable columns={columns} data={categories} />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleAction}
        title={modalContent.title}
        description={modalContent.description}
        confirmText={modalContent.confirmText}
        confirmButtonColor={modalContent.confirmButtonColor}
        isLoading={actionLoading === confirmationModal.categoryId}
      />

      <BoardCategoryModal
        isOpen={categoryModal.isOpen}
        onClose={closeCategoryModal}
        onSave={handleSave}
        category={categoryModal.category}
        isLoading={saveLoading}
      />
    </div>
  );
}
