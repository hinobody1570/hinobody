"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { postsApi, Post } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";

export default function AdminPostsPage() {
  const t = useTranslations("admin");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await postsApi.getAll({ page: 1, limit: 20 });
        setPosts(response.data);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const columns = [
    {
      key: "id",
      header: t("id"),
    },
    {
      key: "title",
      header: t("title"),
      render: (value: string) => (
        <span className="max-w-md truncate block">{value}</span>
      ),
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("posts")}</h1>
      <DataTable columns={columns} data={posts} />
    </div>
  );
}

