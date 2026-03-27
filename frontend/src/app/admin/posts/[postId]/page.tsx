"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { postsApi, Post } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { PostCard } from "@/components/reuseComponents/PostCard";
import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import Image from "next/image";
import DP from "../../../../../public/assets/images/avatar_default_4.png";
import { ROUTE_PATHS } from "@/routes/paths";
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

export default function AdminPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const tPostDetail = useTranslations("postDetail");
  const tTime = useTranslations("timeAgo");
  const postId = params?.postId as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!postId) return;

    const fetchPostData = async () => {
      try {
        setLoading(true);
        setNotFound(false);
        setError(null);
        const postData = await postsApi.getById(postId);
        setPost(postData);
      } catch (err: any) {
        console.error("Error fetching post:", err);
        if (err?.statusCode === 404) {
          setNotFound(true);
          setPost(null);
          return;
        }
        setError(err?.message || t("errorLoadingPost"));
      } finally {
        setLoading(false);
      }
    };

    fetchPostData();
  }, [postId, t]);

  if (loading) {
    return <Loading />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <span className="text-xl font-semibold text-gray-700">?</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{tPostDetail("postNotFound")}</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            {tPostDetail("notFoundDescription")}
          </p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_POSTS)}
            className="min-h-[44px] px-4 py-2.5 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer touch-manipulation"
          >
            {t("backToPosts")}
          </button>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || t("postNotFound")}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_POSTS)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t("backToPosts")}
          </button>
        </div>
      </div>
    );
  }

  const transformedPost = transformPost(post, tTime);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminDetailHeader onClick={() => router.push(ROUTE_PATHS.ADMIN_POSTS)} title={t("postDetails")} />
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Post Detail */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <span>
                <strong>{t("author")}:</strong> {post.author?.nickname || "-"}
              </span>
              <span>
                <strong>{t("board")}:</strong> {post.board?.name || "-"}
              </span>
              <span>
                <strong>{t("status")}:</strong>{" "}
                <span className={post.isActive ? "text-green-600" : "text-red-600"}>{post.isActive ? t("active") : t("inactive")}</span>
              </span>
              <span>
                <strong>{t("createdAt")}:</strong> {formatTimestamp(post.createdAt, tTime)}
              </span>
            </div>
          </div>

          {post.images && post.images.length > 0 && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{t("images")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {post.images.map((image: any) => (
                  <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={image.url}
                      alt="Post image"
                      fill
                      className="object-cover cursor-pointer"
                      onClick={() => window.open(image.url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("upvotes")}</div>
              <div className="text-2xl font-bold text-gray-900">{post.upvoteCount || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("comments")}</div>
              <div className="text-2xl font-bold text-gray-900">{post.commentCount || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("postID")}</div>
              <div className="font-mono text-xs text-gray-700 break-all">{post.id}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">{t("originalLanguage")}</div>
              <div className="font-semibold text-gray-900 uppercase">{post.originalLanguage || "-"}</div>
            </div>
          </div>
        </div>

        {/* Post Card Preview */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{t("postPreview")}</h3>
          <PostCard {...transformedPost} post={transformedPost} />
        </div>
      </div>
    </div>
  );
}
