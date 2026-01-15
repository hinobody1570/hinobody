"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { DataTable } from "@/components/admin/DataTable";
import { usersApi, User } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";

export default function AdminUsersPage() {
  const t = useTranslations("admin");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const columns = [
    {
      key: "id",
      header: t("id"),
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
      render: (value: string) => (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 capitalize">
          {value}
        </span>
      ),
    },
    {
      key: "language",
      header: t("language"),
      render: (value: string) => (
        <span className="uppercase">{value}</span>
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">{t("users")}</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
}

