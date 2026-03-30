"use client";

import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import { PostCard } from "@/components/reuseComponents/PostCard";
import { Board, boardsApi, Post, postsApi } from "@/lib/api";
import { ROUTE_PATHS } from "@/routes/paths";
import { formatTimestamp } from "@/utils/helperFunction";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import DP from "../../../../../public/assets/images/avatar_default_4.png";
import Loading from "@/components/reuseComponents/Loading";

const transformPost = (post: Post, tTime: (key: string, values?: Record<string, number | string>) => string): any => {
  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP,
    verified: false,
    timestamp: formatTimestamp(post.createdAt, tTime),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || "",
  };
};

export default function AdminBoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const tTime = useTranslations("timeAgo");
  const { locale } = useLanguage();
  const boardId = params?.boardId as string;

  const [board, setBoard] = useState<Board | null | any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!boardId) return;

    const fetchBoardData = async () => {
      try {
        setLoading(true);
        const boardData = await boardsApi.getById(boardId);
        setBoard(boardData);
      } catch (err: any) {
        console.error("Error fetching board:", err);
        setError(err.message || t("errorLoadingBoard"));
      } finally {
        setLoading(false);
      }
    };

    fetchBoardData();
  }, [boardId, t]);

  useEffect(() => {
    if (!boardId) return;

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await postsApi.getAll({ boardId, page: 1, limit: 10, includeDeleted: true });
        setPosts(response.data);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [boardId]);

  const displayPosts = useMemo(
    () => posts.map((p) => transformPost(p, tTime)),
    [posts, tTime, locale]
  );

  if (loading) {
    return (
      <Loading />
    );
  }

  if (error || !board) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || t("boardNotFound")}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_BOARDS)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t("backToBoards")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDetailHeader onClick={() => router.push(ROUTE_PATHS.ADMIN_BOARDS)} title={t("boardDetails")} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Board Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">r/{board.name}</h2>
            {board.description && (
              <p className="text-gray-700 mb-4">{board.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span>
                <strong>{t("category")}:</strong> {board.category?.name || '-'}
              </span>
              <span>
                <strong>{t("visibility")}:</strong>{" "}
                <span className="capitalize">{board.visibilityAccess}</span>
              </span>
              <span>
                <strong>{t("status")}:</strong>{" "}
                <span className={board.isActive ? "text-green-600" : "text-red-600"}>
                  {board.isActive ? t("active") : t("inactive")}
                </span>
              </span>
              <span>
                <strong>{t("createdAt")}:</strong> {formatTimestamp(board.createdAt, tTime)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("totalPosts")}</div>
              <div className="text-2xl font-bold text-gray-900">{displayPosts.length}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("boardID")}</div>
              <div className="font-mono text-xs text-gray-700 break-all">{board.id}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("updatedAt")}</div>
              <div className="font-semibold text-gray-900">{formatTimestamp(board.updatedAt, tTime)}</div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t("boardPosts")}</h3>
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}</div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t("noPosts")}</div>
          ) : (
            <div className="space-y-4">
              {displayPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

