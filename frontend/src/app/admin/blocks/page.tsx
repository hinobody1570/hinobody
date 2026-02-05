"use client";

import { DataTable } from "@/components/admin/DataTable";
import ErrorSection from "@/components/reuseComponents/ErrorSection";
import Loading from "@/components/reuseComponents/Loading";
import { Block, blocksApi } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function AdminBlocksPage() {
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
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
      render: (value: string) => formatTimestamp(value, tTime),
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("blocks")}</h1>
      <DataTable columns={columns} data={blocks} />
    </div>
  );
}
