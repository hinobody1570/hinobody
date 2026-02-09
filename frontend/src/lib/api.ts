// API service for making HTTP requests to the backend
// Automatically handles authentication tokens and error handling

import { API_END_POINT } from "./apiEndpoints";

// For client-side requests, we need to use the full backend URL
// Next.js rewrites only work for server-side requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface ApiResponse<T = any> {
  statusCode: number;
  message: string;
  error: boolean;
  data: T;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const url = `${API_BASE_URL}${endpoint}`;

    // Debug: Log the URL being called (remove in production)
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('API Request:', url);
    // }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle error responses
        const error: ApiError = {
          message: data.message || data.error || 'An error occurred',
          statusCode: response.status,
          error: data.error,
        };
        throw error;
      }

      return data;
    } catch (error) {
      // Handle network errors or other exceptions
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw {
          message: 'Network error. Please check your connection.',
          statusCode: 0,
        } as ApiError;
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    return api.post<ApiResponse<{ access_token: string; user: any }>>(API_END_POINT.LOGIN, {
      email,
      password,
    });
  },

  register: async (data: {
    email: string;
    password: string;
    nickname: string;
    language?: string;
  }) => {
    return api.post<ApiResponse<{ message: string; user: any }>>(API_END_POINT.REGISTER_ACCOUNT, data);
  },

  verifyEmail: async (email: string, otp: string) => {
    return api.post<ApiResponse<{ message: string; user: any }>>(API_END_POINT.VERIFY_EMAIL, {
      email,
      otp,
    });
  },

  resendOtp: async (email: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.RESEND_OTP, { email });
  },

  forgotPassword: async (email: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.FORGOT_PASSWORD, { email });
  },

  resetPassword: async (token: string, newPassword: string) => {
    return api.post<ApiResponse<{ message: string }>>(API_END_POINT.RESET_PASSWORD, {
      token,
      newPassword,
    });
  },

  googleLogin: async () => {
    // Redirect to backend Google OAuth endpoint
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${API_BASE_URL}${API_END_POINT.GOOGLE_AUTH}`;
  },

  googleMobileLogin: async (data: {
    idToken: string;
    accessToken: string;
    email: string;
    firstName?: string;
    lastName?: string;
    picture?: string;
    providerId: string;
  }) => {
    return api.post<ApiResponse<{ access_token: string; user: any }>>(
      API_END_POINT.GOOGLE_MOBILE,
      data
    );
  },

  appleLogin: async () => {
    // Redirect to backend Apple OAuth endpoint (server-side flow)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    window.location.href = `${API_BASE_URL}${API_END_POINT.APPLE_AUTH}`;
  },

  appleTokenLogin: async (idToken: string) => {
    // Client-side flow with idToken from Apple JS SDK
    return api.post<ApiResponse<{ access_token: string; user: any }>>(
      API_END_POINT.APPLE_TOKEN,
      { idToken }
    );
  },
};

// Boards API endpoints
export type BoardVisibility = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

export interface Board {
  id: string;
  name: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    active: boolean;
  };
  description: string | null;
  visibilityAccess: BoardVisibility;
  isActive: boolean;
  creatorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBoardDto {
  name: string;
  categoryId: string;
  description?: string;
  visibilityAccess?: BoardVisibility;
}

export interface BoardsResponse {
  data: Board[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BoardMembership {
  id: string;
  userId: string;
  boardId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string;
    email?: string;
    avatar?: string;
    createdAt?: string;
  };
  board?: {
    id: string;
    name: string;
    description?: string;
    visibilityAccess: BoardVisibility;
  };
}

export const boardsApi = {
  getAll: async (page: number = 1, limit: number = 20, search?: string): Promise<BoardsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await api.get<ApiResponse<BoardsResponse>>(`${API_END_POINT.BOARDS}?${params.toString()}`);
    // The API returns { statusCode, message, error, data: { data: Board[], meta: {...} } }
    return response.data;
  },
  getById: async (id: string): Promise<Board> => {
    const response = await api.get<ApiResponse<Board>>(`${API_END_POINT.BOARDS}/${id}`);
    return response.data;
  },
  create: async (createBoardDto: CreateBoardDto): Promise<Board> => {
    const response = await api.post<ApiResponse<Board>>(API_END_POINT.BOARDS, createBoardDto);
    // The API returns { statusCode, message, error, data: Board }
    return response.data;
  },
  join: async (boardId: string): Promise<BoardMembership> => {
    const response = await api.post<ApiResponse<BoardMembership>>(`${API_END_POINT.BOARDS}/${boardId}/join`);
    return response.data;
  },
  getMembershipStatus: async (boardId: string): Promise<BoardMembership | null> => {
    const response = await api.get<ApiResponse<BoardMembership | null>>(`${API_END_POINT.BOARDS}/${boardId}/membership`);
    return response.data;
  },
  leave: async (boardId: string): Promise<void> => {
    await api.delete(`${API_END_POINT.BOARDS}/${boardId}/leave`);
  },
  update: async (id: string, updateBoardDto: { isActive?: boolean }): Promise<Board> => {
    const response = await api.patch<ApiResponse<Board>>(`${API_END_POINT.BOARDS}/${id}`, updateBoardDto);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.BOARDS}/${id}`);
  },
  getByUserId: async (userId: string): Promise<{ created: Board[]; member: Board[] }> => {
    const response = await api.get<ApiResponse<{ created: Board[]; member: Board[] }>>(`${API_END_POINT.BOARDS}/user/${userId}`);
    return response.data;
  },
  getPendingRequests: async (): Promise<BoardMembership[]> => {
    const response = await api.get<ApiResponse<BoardMembership[]>>(`${API_END_POINT.BOARDS}/pending-requests`);
    return response.data;
  },
  approveMembership: async (membershipId: string): Promise<BoardMembership> => {
    const response = await api.patch<ApiResponse<BoardMembership>>(`${API_END_POINT.BOARDS}/membership/${membershipId}/approve`);
    return response.data;
  },
  rejectMembership: async (membershipId: string): Promise<void> => {
    await api.delete(`${API_END_POINT.BOARDS}/membership/${membershipId}/reject`);
  },
};

// Board Categories API endpoints
export interface BoardCategory {
  id: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BoardCategoriesResponse {
  data: BoardCategory[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateBoardCategoryDto {
  name: string;
  active?: boolean;
}

export interface UpdateBoardCategoryDto {
  name?: string;
  active?: boolean;
}

export const boardCategoriesApi = {
  getAll: async (page: number = 1, limit: number = 20, search?: string, active?: boolean): Promise<BoardCategoriesResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    if (active !== undefined) {
      params.append('active', active.toString());
    }
    const response = await api.get<ApiResponse<BoardCategoriesResponse>>(`${API_END_POINT.BOARD_CATEGORIES}?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<BoardCategory> => {
    const response = await api.get<ApiResponse<BoardCategory>>(`${API_END_POINT.BOARD_CATEGORIES}/${id}`);
    return response.data;
  },
  create: async (createBoardCategoryDto: CreateBoardCategoryDto): Promise<BoardCategory> => {
    const response = await api.post<ApiResponse<BoardCategory>>(API_END_POINT.BOARD_CATEGORIES, createBoardCategoryDto);
    return response.data;
  },
  update: async (id: string, updateBoardCategoryDto: UpdateBoardCategoryDto): Promise<BoardCategory> => {
    const response = await api.patch<ApiResponse<BoardCategory>>(`${API_END_POINT.BOARD_CATEGORIES}/${id}`, updateBoardCategoryDto);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.BOARD_CATEGORIES}/${id}`);
  },
};

// Posts API endpoints
export type Language = 'EN' | 'KO' | 'ZH' | 'JA';

export type PostCategory = 'News' | 'Reviews' | 'Recommend' | 'Free Board';

export interface CreatePostDto {
  title: string;
  body: string;
  originalLanguage: Language;
  boardId?: string;
  category?: PostCategory;
  imageIds?: string[];
  tags?: string[];
  isActive?: boolean; // false for draft, true (default) for published
}

export interface Post {
  id: string;
  title: string;
  body: string;
  originalLanguage: Language;
  authorId: string;
  boardId?: string | null;
  postCategory?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  upvoteCount: number;
  downvoteCount: number;
  commentCount: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  // Relations included in findAll response
  author?: {
    id: string;
    nickname: string;
    language: string;
  };
  board?: Board;
  images?: Array<{
    id: string;
    key: string;
    url: string;
    createdAt: string;
    updatedAt: string;
  }>;
  _count?: {
    comments: number;
    votes: number;
  };
}

export interface PostsResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export type PostSortBy = 'newest' | 'mostLiked' | 'trending';

export interface QueryPostsParams {
  page?: number;
  limit?: number;
  boardId?: string;
  authorId?: string;
  search?: string;
  sortBy?: PostSortBy;
  category?: string;
}

export const postsApi = {
  create: async (createPostDto: CreatePostDto): Promise<Post> => {
    const response = await api.post<ApiResponse<Post>>(API_END_POINT.POSTS, createPostDto);
    // The API returns { statusCode, message, error, data: Post }
    return response.data;
  },
  getAll: async (params: QueryPostsParams = {}): Promise<PostsResponse> => {
    const { page = 1, limit = 20, boardId, authorId, search, sortBy, category } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (boardId) {
      queryParams.append('boardId', boardId);
    }
    if (authorId) {
      queryParams.append('authorId', authorId);
    }
    if (search) {
      queryParams.append('search', search);
    }
    if (sortBy) {
      queryParams.append('sortBy', sortBy);
    }
    if (category) {
      queryParams.append('category', category);
    }
    const response = await api.get<ApiResponse<PostsResponse>>(`${API_END_POINT.POSTS}?${queryParams.toString()}`);
    // The API returns { statusCode, message, error, data: { data: Post[], meta: {...} } }
    return response.data;
  },
  getById: async (id: string): Promise<Post> => {
    const response = await api.get<ApiResponse<Post>>(`${API_END_POINT.POSTS}/${id}`);
    return response.data;
  },
  update: async (id: string, updatePostDto: { isActive?: boolean }): Promise<Post> => {
    const response = await api.patch<ApiResponse<Post>>(`${API_END_POINT.POSTS}/${id}`, updatePostDto);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.POSTS}/${id}`);
  },
};

// S3 Upload API
export interface S3UploadResponse {
  key: string;
  url: string;
}

export interface S3File {
  key: string;
  url: string;
  size: number;
  lastModified: string;
}

export const s3Api = {
  getAllFiles: async (prefix?: string): Promise<S3File[]> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const url = `${API_BASE_URL}${API_END_POINT.S3_FILES}${prefix ? `?prefix=${encodeURIComponent(prefix)}` : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to get S3 files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || data;
  },

  deleteFile: async (key: string): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const encodedKey = encodeURIComponent(key);
    const url = `${API_BASE_URL}${API_END_POINT.S3_FILES}/${encodedKey}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete S3 file: ${response.statusText}`);
    }
  },

  uploadFile: async (file: File, folder?: string): Promise<S3UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${API_BASE_URL}${API_END_POINT.S3_UPLOAD}${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    const data = await response.json();
    // The API returns { statusCode, message, error, data: { key, url } }
    return data.data;
  },

  uploadFiles: async (files: File[], folder?: string): Promise<S3UploadResponse[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folder) {
      formData.append('folder', folder);
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${API_BASE_URL}${API_END_POINT.S3_UPLOAD_BULK}${folder ? `?folder=${encodeURIComponent(folder)}` : ''}`;

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload files');
    }

    const data = await response.json();
    // The API returns { statusCode, message, error, data: Array<{ key, url }> }
    return data.data;
  },
};

// Eye Masked Images API
export interface EyeMaskedImage {
  id: string;
  url: string;
  key: string;
  userId: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  createdAt: string;
  user?: {
    id: string;
    nickname: string;
    email: string;
  };
}

export interface CreateImageDto {
  url: string;
  key: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

export const imagesApi = {
  create: async (dto: CreateImageDto): Promise<{ id: string }> => {
    const response = await api.post<ApiResponse<{ id: string }>>(API_END_POINT.IMAGES, dto);
    return { id: (response.data as { id: string }).id };
  },
};

export interface CreateEyeMaskedImageDto {
  url: string;
  key: string;
  size?: number;
  mimeType?: string;
  width?: number;
  height?: number;
}

export const eyeMaskedImagesApi = {
  createBulk: async (images: CreateEyeMaskedImageDto[]): Promise<EyeMaskedImage[]> => {
    const response = await api.post<ApiResponse<EyeMaskedImage[]>>(
      API_END_POINT.EYE_MASKED_IMAGES_BULK,
      { images }
    );
    return response.data;
  },

  getAll: async (userId?: string): Promise<EyeMaskedImage[]> => {
    const url = userId 
      ? `${API_END_POINT.EYE_MASKED_IMAGES}/all?userId=${userId}`
      : `${API_END_POINT.EYE_MASKED_IMAGES}/all`;
    const response = await api.get<ApiResponse<EyeMaskedImage[]>>(url);
    return response.data;
  },

  getById: async (id: string): Promise<EyeMaskedImage> => {
    const response = await api.get<ApiResponse<EyeMaskedImage>>(`${API_END_POINT.EYE_MASKED_IMAGES}/${id}`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.EYE_MASKED_IMAGES}/${id}`);
  },
};

// Votes API endpoints
export type VoteType = 'UPVOTE' | 'DOWNVOTE';

export interface CreateVoteDto {
  type: VoteType;
  postId?: string;
  commentId?: string;
}

export interface Vote {
  id: string;
  type: VoteType;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface VoteResponse {
  vote: Vote | null;
  action: 'created' | 'updated' | 'removed';
  upvoteCount: number;
  downvoteCount: number;
}

export const votesApi = {
  createOrUpdate: async (createVoteDto: CreateVoteDto): Promise<VoteResponse> => {
    const response = await api.post<ApiResponse<VoteResponse>>(API_END_POINT.VOTES, createVoteDto);
    return response.data;
  },
  getUserVote: async (postId?: string, commentId?: string): Promise<Vote | null> => {
    const params = new URLSearchParams();
    if (postId) params.append('postId', postId);
    if (commentId) params.append('commentId', commentId);
    const response = await api.get<ApiResponse<Vote | null>>(`${API_END_POINT.VOTES}/user-vote?${params.toString()}`);
    return response.data;
  },
};

// Comments API endpoints
export interface Comment {
  id: string;
  body: string;
  originalLanguage: Language;
  postId: string;
  authorId: string;
  parentId?: string | null;
  isActive: boolean;
  isDeleted: boolean;
  upvoteCount: number;
  downvoteCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    nickname: string;
  };
  replies?: Comment[];
  _count?: {
    votes: number;
    replies: number;
  };
}

export interface CommentsResponse {
  data: Comment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCommentDto {
  body: string;
  originalLanguage: Language;
  postId: string;
  parentId?: string;
}

export const commentsApi = {
  getByPost: async (postId: string, page: number = 1, limit: number = 20, search?: string): Promise<CommentsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await api.get<ApiResponse<CommentsResponse>>(`${API_END_POINT.COMMENTS}/post/${postId}?${params.toString()}`);
    return response.data;
  },
  create: async (createCommentDto: CreateCommentDto): Promise<Comment> => {
    const response = await api.post<ApiResponse<Comment>>(API_END_POINT.COMMENTS, createCommentDto);
    return response.data;
  },
};

// Reports API endpoints
export interface CreateReportDto {
  reason: string;
  postId?: string;
  commentId?: string;
}

export interface ReportsResponse {
  data: Report[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Report {
  id: string;
  reason: string;
  status: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
  postId?: string;
  commentId?: string;
  reportedById: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reportedBy?: {
    id: string;
    nickname: string;
  };
  post?: {
    id: string;
    title: string;
    author?: {
      id: string;
      nickname: string;
    };
  };
  comment?: {
    id: string;
    body: string;
    author?: {
      id: string;
      nickname: string;
    };
  };
}

export interface UpdateReportDto {
  status?: 'PENDING' | 'REVIEWED' | 'RESOLVED' | 'DISMISSED';
}

export const reportsApi = {
  create: async (createReportDto: CreateReportDto): Promise<Report> => {
    const response = await api.post<ApiResponse<Report>>(API_END_POINT.REPORTS, createReportDto);
    return response.data;
  },
  getAll: async (page: number = 1, limit: number = 20, status?: string, search?: string): Promise<ReportsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (status) {
      params.append('status', status);
    }
    if (search) {
      params.append('search', search);
    }
    const response = await api.get<ApiResponse<ReportsResponse>>(`${API_END_POINT.REPORTS}?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<Report> => {
    const response = await api.get<ApiResponse<Report>>(`${API_END_POINT.REPORTS}/${id}`);
    return response.data;
  },
  update: async (id: string, updateReportDto: UpdateReportDto): Promise<Report> => {
    const response = await api.patch<ApiResponse<Report>>(`${API_END_POINT.REPORTS}/${id}`, updateReportDto);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.REPORTS}/${id}`);
  },
};

// Users API
export interface UpdateUserDto {
  nickname?: string;
  language?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface UsersResponse {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const usersApi = {
  getAll: async (page: number = 1, limit: number = 20, search?: string): Promise<UsersResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) {
      params.append('search', search);
    }
    const response = await api.get<ApiResponse<UsersResponse>>(`${API_END_POINT.USERS}?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<User> => {
    const response = await api.get<ApiResponse<User>>(`${API_END_POINT.USERS}/${id}`);
    return response.data;
  },
  update: async (id: string, updateUserDto: UpdateUserDto): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`${API_END_POINT.USERS}/${id}`, updateUserDto);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`${API_END_POINT.USERS}/${id}`);
  },
  block: async (id: string): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`${API_END_POINT.USERS}/${id}`, { isActive: false });
    return response.data;
  },
  unblock: async (id: string): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>(`${API_END_POINT.USERS}/${id}`, { isActive: true });
    return response.data;
  },
};

// User interface
export interface User {
  id: string;
  email: string;
  nickname: string;
  language: string;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Search API
export interface SearchParams {
  q?: string;
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  users: {
    data: User[];
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
  posts: PostsResponse;
  boards: BoardsResponse;
}

export const searchApi = {
  search: async (params: SearchParams = {}): Promise<SearchResponse> => {
    const { q, page = 1, limit = 10 } = params;
    const queryParams = new URLSearchParams();
    if (q) {
      queryParams.append('q', q);
    }
    queryParams.append('page', page.toString());
    queryParams.append('limit', limit.toString());
    const response = await api.get<ApiResponse<SearchResponse>>(`/search?${queryParams.toString()}`);
    return response.data;
  },
};

// Blocks API endpoints
export interface Block {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
  blocker?: {
    id: string;
    nickname: string;
    email: string;
  };
  blocked?: {
    id: string;
    nickname: string;
    email: string;
  };
}

export interface BlocksResponse {
  data: Block[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const blocksApi = {
  getAll: async (page: number = 1, limit: number = 20): Promise<BlocksResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    const response = await api.get<ApiResponse<BlocksResponse>>(`${API_END_POINT.BLOCKS}/admin?${params.toString()}`);
    return response.data;
  },
  getById: async (id: string): Promise<Block> => {
    const response = await api.get<ApiResponse<Block>>(`${API_END_POINT.BLOCKS}/${id}`);
    return response.data;
  },
  checkBlockStatus: async (blockedId: string): Promise<boolean> => {
    const response = await api.get<ApiResponse<boolean>>(`${API_END_POINT.BLOCKS}/check/${blockedId}`);
    return response.data;
  },
  blockUser: async (blockedId: string): Promise<Block> => {
    const response = await api.post<ApiResponse<Block>>(API_END_POINT.BLOCKS, { blockedId });
    return response.data;
  },
  unblockUser: async (blockedId: string): Promise<void> => {
    await api.delete(`${API_END_POINT.BLOCKS}/${blockedId}`);
  },
};

