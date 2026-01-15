"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { boardsApi, Board } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";

export default function AdminBoardsPage() {
  const t = useTranslations("admin");
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBoards = async () => {
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
    };

    fetchBoards();
  }, []);

  const columns = [
    {
      key: "id",
      header: t("id"),
    },
    {
      key: "name",
      header: t("name"),
      render: (value: string) => (
        <span className="font-semibold">r/{value}</span>
      ),
    },
    {
      key: "category",
      header: t("category"),
    },
    {
      key: "description",
      header: t("description"),
      render: (value: string) => (
        <span className="max-w-md truncate block">{value || "-"}</span>
      ),
    },
    {
      key: "visibilityAccess",
      header: t("visibility"),
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 capitalize">
          {value}
        </span>
      ),
    },
    {
      key: "isActive",
      header: t("status"),
      render: (value: boolean) => (
        <span
          className={`px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value ? t("active") : t("inactive")}
        </span>
      ),
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("boards")}</h1>
      <DataTable columns={columns} data={boards} />
    </div>
  );
}

