"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { blocksApi, Block } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useToast } from "@/contexts/ToastContext";

export default function AdminBlocksPage() {
  const t = useTranslations("admin");
  const tToast = useTranslations("toast");
  const { showSuccess, showError } = useToast();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await blocksApi.getAll(1, 20);
        setBlocks(response.data);
      } catch (err: any) {
        console.error("Error fetching blocks:", err);
        setError(err.message || "Failed to load blocks");
      } finally {
        setLoading(false);
      }
    };

    fetchBlocks();
  }, []);

  const columns = [
    {
      key: "id",
      header: t("id"),
    },
    {
      key: "blocker",
      header: t("blocker"),
      render: (value: any) => (value ? value.nickname : "-"),
    },
    {
      key: "blocked",
      header: t("blocked"),
      render: (value: any) => (value ? value.nickname : "-"),
    },
    {
      key: "createdAt",
      header: t("createdAt"),
      render: (value: string) => formatTimestamp(value),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("blocks")}</h1>
      <DataTable columns={columns} data={blocks} />
    </div>
  );
}

