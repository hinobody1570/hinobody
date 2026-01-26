"use client";

import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import { PostCard } from "@/components/reuseComponents/PostCard";
import { Board, EyeMaskedImage, Post, User, boardsApi, eyeMaskedImagesApi, postsApi, usersApi } from "@/lib/api";
import { ROUTE_PATHS } from "@/routes/paths";
import { formatTimestamp } from "@/utils/helperFunction";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheckCircle, FaEnvelope, FaGlobe, FaImage, FaImages, FaShieldAlt, FaTimesCircle } from "react-icons/fa";
import DP from "../../../../../public/assets/images/avatar_default_4.png";
import Loading from "@/components/reuseComponents/Loading";

const transformPost = (post: Post): any => {
  return {
    id: post.id,
    boardId: post.boardId,
    authorId: post.authorId,
    community: post.board?.name ? `r/${post.board.name}` : "r/community",
    communityAvatar: DP,
    verified: false,
    timestamp: formatTimestamp(post.createdAt),
    title: post.title,
    image: post.images && post.images.length > 0 ? post.images[0].url : null,
    upvotes: post.upvoteCount || 0,
    downvotes: post.downvoteCount || 0,
    comments: post.commentCount || 0,
    body: post.body || "",
  };
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("admin");
  const userId = params?.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [eyeMaskedImages, setEyeMaskedImages] = useState<EyeMaskedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = await usersApi.getById(userId);
        setUser(userData);
      } catch (err: any) {
        console.error("Error fetching user:", err);
        setError(err.message || t("errorLoadingUser"));
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, t]);

  useEffect(() => {
    if (!userId) return;

    const fetchPosts = async () => {
      try {
        setLoadingPosts(true);
        const response = await postsApi.getAll({ authorId: userId, page: 1, limit: 10 });
        const transformedPosts = response.data.map(transformPost);
        setPosts(transformedPosts);
      } catch (err: any) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchPosts();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchBoards = async () => {
      try {
        setLoadingBoards(true);
        // Fetch all boards and filter by creatorId on frontend
        // Or we can add a backend endpoint to get boards by creatorId
        const response = await boardsApi.getAll(1, 100);
        const userBoards = response.data.filter((board: Board) => board.creatorId === userId);
        setBoards(userBoards);
      } catch (err: any) {
        console.error("Error fetching boards:", err);
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchBoards();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchEyeMaskedImages = async () => {
      try {
        setLoadingImages(true);
        const images = await eyeMaskedImagesApi.getAll(userId);
        setEyeMaskedImages(images);
      } catch (err: any) {
        console.error("Error fetching eye masked images:", err);
      } finally {
        setLoadingImages(false);
      }
    };

    fetchEyeMaskedImages();
  }, [userId]);

  if (loading) {
    return <Loading />;
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error || t("userNotFound")}</p>
          <button
            onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            {t("backToUsers")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminDetailHeader onClick={() => router.push(ROUTE_PATHS.ADMIN_USERS)} title={t("userDetails")} />
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex items-end gap-6">
              <div className="relative">
                <Image
                  src={user.avatar ? user.avatar : DP}
                  alt={user.nickname || user.email}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
              </div>
              <div className="flex-1 pb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{user.nickname || user.email}</h2>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaEnvelope size={14} />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaShieldAlt size={14} />
                    <span className="capitalize">{user.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaGlobe size={14} />
                    <span className="uppercase">{user.language}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{t("status")}</div>
                <div className="flex items-center gap-2">
                  {user.isActive ? (
                    <>
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="font-semibold text-green-700">{t("active")}</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-red-500" size={16} />
                      <span className="font-semibold text-red-700">{t("inactive")}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{t("emailVerified")}</div>
                <div className="flex items-center gap-2">
                  {user.emailVerified ? (
                    <>
                      <FaCheckCircle className="text-green-500" size={16} />
                      <span className="font-semibold text-green-700">{t("verified")}</span>
                    </>
                  ) : (
                    <>
                      <FaTimesCircle className="text-yellow-500" size={16} />
                      <span className="font-semibold text-yellow-700">{t("nonVerified")}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{t("memberSince")}</div>
                <div className="font-semibold text-gray-900">{formatTimestamp(user.createdAt)}</div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">{t("userID")}</div>
                <div className="font-mono text-xs text-gray-700 break-all">{user.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t("totalPosts")}</div>
                <div className="text-3xl font-bold text-gray-900">{posts.length}</div>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <FaImage className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t("totalBoards")}</div>
                <div className="text-3xl font-bold text-gray-900">{boards.length}</div>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <FaShieldAlt className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">{t("eyeMaskedImages")}</div>
                <div className="text-3xl font-bold text-gray-900">{eyeMaskedImages.length}</div>
              </div>
              <div className="bg-purple-100 rounded-full p-3">
                <FaImages className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaImage size={20} />
            <span>{t("userPosts")}</span>
          </h3>
          {loadingPosts ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t("noPosts")}</div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* Boards Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaShieldAlt size={20} />
            <span>{t("userBoards")}</span>
          </h3>
          {loadingBoards ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}</div>
          ) : boards.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t("noBoards")}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boards.map((board: any) => (
                <div
                  key={board.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/main/board/${board.id}`)}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{board.name}</h4>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description || t("noDescription")}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{board.category}</span>
                    <span className="capitalize">{board.visibilityAccess}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Eye Masked Images Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaImages size={20} />
            <span>{t("eyeMaskedImages")}</span>
          </h3>
          {loadingImages ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}</div>
          ) : eyeMaskedImages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t("noEyeMaskedImages")}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {eyeMaskedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => window.open(image.url, "_blank")}
                >
                  <Image
                    src={image.url}
                    alt="Eye masked image"
                    height={100}
                    width={400}
                    className="object-containt group-hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
