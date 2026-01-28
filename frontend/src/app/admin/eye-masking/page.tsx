"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { eyeMaskedImagesApi, EyeMaskedImage } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";
import { FaTrash } from "react-icons/fa";
import { ConfirmationModal } from "@/components/modals/ConfirmationModal";
import Image from "next/image";
import Loading from "@/components/reuseComponents/Loading";
import ErrorSection from "@/components/reuseComponents/ErrorSection";

export default function AdminEyeMaskingPage() {
  const t = useTranslations("admin");
  const { showSuccess, showError } = useToast();
  const [images, setImages] = useState<EyeMaskedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    imageId: string | null;
    imageUrl: string | null;
  }>({
    isOpen: false,
    imageId: null,
    imageUrl: null,
  });

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const allImages = await eyeMaskedImagesApi.getAll();
        setImages(allImages);
      } catch (err: any) {
        console.error("Error fetching eye masked images:", err);
        setError(err.message || "Failed to load eye masked images");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const openConfirmationModal = (imageId: string, imageUrl: string) => {
    setConfirmationModal({
      isOpen: true,
      imageId,
      imageUrl,
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      imageId: null,
      imageUrl: null,
    });
  };

  const handleDelete = async () => {
    if (!confirmationModal.imageId) return;

    const imageId = confirmationModal.imageId;

    try {
      setActionLoading(imageId);
      await eyeMaskedImagesApi.delete(imageId);
      showSuccess(t("eyeMaskedImageDeleted"));

      // Refresh images list
      const allImages = await eyeMaskedImagesApi.getAll();
      setImages(allImages);

      closeConfirmationModal();
    } catch (err: any) {
      console.error("Error deleting eye masked image:", err);
      showError(err.message || t("deleteEyeMaskedImageError"));
    } finally {
      setActionLoading(null);
    }
  };

  const columns = [
    {
      key: "id",
      header: t("id"),
      render: (value: string) => <span className="font-mono text-xs">{value.substring(0, 8)}...</span>,
    },
    {
      key: "image",
      header: t("image"),
      render: (_: any, row: EyeMaskedImage) => (
        <div
          className="relative w-32 h-12 rounded-lg overflow-hidden border border-gray-200 cursor-pointer"
          onClick={() => window.open(row.url, "_blank")}
        >
          <Image src={row.url} alt="Eye masked image" fill className="object-containt" unoptimized />
        </div>
      ),
    },
    {
      key: "nickname",
      header: t("nickname"),
      render: (_: any, row: EyeMaskedImage) => <span>{row.user?.nickname || "-"}</span>,
    },
    {
      key: "url",
      header: t("url"),
      render: (value: string) => (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate max-w-md block">
          {value}
        </a>
      ),
    },
    {
      key: "size",
      header: t("size"),
      render: (value: number) => <span>{value ? `${(value / 1024).toFixed(2)} KB` : "-"}</span>,
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value),
    },
    {
      key: "actions",
      header: "",
      actions: (row: EyeMaskedImage) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openConfirmationModal(row.id, row.url)}
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
    return (
      <ErrorSection error={error}/>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("eyeMasking")}</h1>
      <DataTable columns={columns} data={images} />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={handleDelete}
        title={t("deleteEyeMaskedImage")}
        description={t("confirmDeleteEyeMaskedImageDescription")}
        confirmText={t("delete")}
        confirmButtonColor="red"
        isLoading={actionLoading === confirmationModal.imageId}
      />
    </div>
  );
}
