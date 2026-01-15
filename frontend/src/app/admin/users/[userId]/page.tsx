"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { usersApi, User, postsApi, Post, boardsApi, Board, eyeMaskedImagesApi, EyeMaskedImage, s3Api, S3File } from "@/lib/api";
import { formatTimestamp } from "@/utils/helperFunction";
import { PostCard } from "@/components/reuseComponents/PostCard";
import { FaArrowLeft, FaUser, FaEnvelope, FaShieldAlt, FaGlobe, FaCheckCircle, FaTimesCircle, FaImage, FaImages, FaTrash } from "react-icons/fa";
import Image from "next/image";
import DP from "../../../../../public/assets/images/avatar_default_4.png";
import AdminDetailHeader from "@/components/admin/AdminDetailHeader";
import { ROUTE_PATHS } from "@/routes/paths";

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
  const [s3Files, setS3Files] = useState<S3File[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [loadingBoards, setLoadingBoards] = useState(true);
  const [loadingImages, setLoadingImages] = useState(true);
  const [loadingS3Files, setLoadingS3Files] = useState(true);
  const [deletingS3File, setDeletingS3File] = useState<string | null>(null);
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

  useEffect(() => {
    if (!userId) return;

    const fetchS3Files = async () => {
      try {
        setLoadingS3Files(true);
        // Fetch all S3 files, optionally filter by user-specific prefix if needed
        const files = await s3Api.getAllFiles();
        setS3Files(files);
      } catch (err: any) {
        console.error("Error fetching S3 files:", err);
      } finally {
        setLoadingS3Files(false);
      }
    };

    fetchS3Files();
  }, [userId]);

  const handleDeleteS3File = async (key: string) => {
    if (!confirm(t("confirmDeleteS3File"))) {
      return;
    }

    try {
      setDeletingS3File(key);
      await s3Api.deleteFile(key);
      // Remove the file from the list
      setS3Files((prev) => prev.filter((file) => file.key !== key));
    } catch (err: any) {
      console.error("Error deleting S3 file:", err);
      alert(err.message || t("deleteS3FileError"));
    } finally {
      setDeletingS3File(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">{t("loading")}</div>
      </div>
    );
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
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-32"></div>
          <div className="px-6 pb-6 -mt-16">
            <div className="flex items-end gap-6">
              <div className="relative">
                <Image src={DP} alt={user.nickname || user.email} width={120} height={120} className="rounded-full border-4 border-white shadow-lg" />
              </div>
              <div className="flex-1 pb-4">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{user.nickname || user.email}</h2>
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
                <PostCard key={post.id} {...post} />
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
              {boards.map((board) => (
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
                  <Image src={image.url} alt="Eye masked image" fill className="object-cover group-hover:scale-105 transition-transform" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* S3 Files Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaImages size={20} />
            <span>{t("s3Files")}</span>
          </h3>
          {loadingS3Files ? (
            <div className="text-center py-8 text-gray-500">{t("loading")}</div>
          ) : s3Files.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t("noS3Files")}</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {s3Files.map((file) => {
                const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.key);
                return (
                  <div
                    key={file.key}
                    className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow group"
                  >
                    {isImage ? (
                      <>
                        <Image
                          src={file.url}
                          alt={file.key}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => window.open(file.url, "_blank")}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteS3File(file.key);
                          }}
                          disabled={deletingS3File === file.key}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg z-10"
                          title={t("delete")}
                        >
                          <FaTrash size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
                        <FaImage className="text-gray-400 mb-2" size={32} />
                        <p className="text-xs text-gray-600 text-center truncate w-full px-2">{file.key.split('/').pop()}</p>
                        <button
                          onClick={() => handleDeleteS3File(file.key)}
                          disabled={deletingS3File === file.key}
                          className="mt-2 bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                          title={t("delete")}
                        >
                          {deletingS3File === file.key ? t("deleting") : t("delete")}
                        </button>
                      </div>
                    )}
                    {deletingS3File === file.key && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                        <div className="text-white text-sm">{t("deleting")}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
