'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { User } from '@/lib/api';
import { formatTimestamp } from '@/utils/helperFunction';
import { FiEdit, FiCamera, FiUserX } from 'react-icons/fi';
import DP from '../../../public/assets/images/avatar_default_4.png';
import { usersApi, s3Api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

interface UserProfileHeaderProps {
  user: User;
  isOwnProfile: boolean;
  isBlocked: boolean;
  isCheckingBlock: boolean;
  isBlocking: boolean;
  onBlockClick: () => void;
  onUnblockClick: () => void;
  onUserUpdate?: (updatedUser: User) => void;
  currentUser?: { id: string } | null;
}

export function UserProfileHeader({
  user,
  isOwnProfile,
  isBlocked,
  isCheckingBlock,
  isBlocking,
  onBlockClick,
  onUnblockClick,
  onUserUpdate,
  currentUser,
}: UserProfileHeaderProps) {
  const t = useTranslations('userProfile');
  const tTime = useTranslations('timeAgo');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { showSuccess, showError } = useToast();
  
  const [editForm, setEditForm] = useState({
    nickname: user.nickname,
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({ nickname: user.nickname });
  };

  const handleSaveEdit = async () => {
    try {
      const updatedUser = await usersApi.update(user.id, editForm);
      setIsEditing(false);
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
      showSuccess(t('nicknameUpdatedSuccessfully'));
    } catch (err: any) {
      console.error('Error updating user:', err);
      showError(err.message || t('failedToUpdateProfile'));
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert(t('pleaseSelectImageFile'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(t('imageSizeTooLarge'));
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const uploadResponse = await s3Api.uploadFile(file, 'avatars');
      const updatedUser = await usersApi.update(user.id, { avatar: uploadResponse.url });
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      alert(err.message || t('failedToUploadAvatar'));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 md:p-6 mb-4 sm:mb-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 md:gap-6">
        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
          {isUploadingAvatar ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-xs sm:text-sm">{t('uploading')}</div>
            </div>
          ) : (
            <Image
              src={user.avatar || DP}
              alt={user.nickname}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-gray-300 object-cover"
              width={96}
              height={96}
              unoptimized={!!user.avatar}
            />
          )}
          {isOwnProfile && !isUploadingAvatar && (
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-1.5 sm:p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg touch-manipulation">
              <FiCamera size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 mb-2">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="w-full sm:max-w-xs text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-2 sm:py-1 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate min-w-0">{user.nickname}</h1>
              )}
              {!isOwnProfile && isBlocked && (
                <span className="text-xs sm:text-sm bg-red-100 text-red-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full flex items-center gap-1 flex-shrink-0">
                  <FiUserX size={14} />
                  {t('blockedUser')}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
              {!isOwnProfile && currentUser && (
                <>
                  {isBlocked ? (
                    <button
                      onClick={onUnblockClick}
                      disabled={isBlocking}
                      className="flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] sm:min-h-0 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50 touch-manipulation text-sm"
                    >
                      <FiUserX size={16} />
                      <span>{isBlocking ? t('processing') : t('unblockUser')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={onBlockClick}
                      disabled={isCheckingBlock || isBlocking}
                      className="flex items-center justify-center gap-2 px-3 py-2 min-h-[40px] sm:min-h-0 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50 touch-manipulation text-sm"
                    >
                      <FiUserX size={16} />
                      <span>{t('blockUser')}</span>
                    </button>
                  )}
                </>
              )}
              {isOwnProfile && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-3 py-2 sm:px-2 sm:py-1 min-h-[40px] sm:min-h-0 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer touch-manipulation text-sm"
                >
                  <FiEdit size={16} />
                  <span>{t('edit')}</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base truncate">{user.email}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-500">
            <span>{t('memberSince')}: {formatTimestamp(user.createdAt, tTime)}</span>
            <span className="capitalize">{user.role}</span>
            <span className="uppercase">{user.language}</span>
          </div>
          {isEditing && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 sm:px-2 sm:py-1 min-h-[40px] sm:min-h-0 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer touch-manipulation text-sm"
              >
                {t('save')}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 sm:px-2 sm:py-1 min-h-[40px] sm:min-h-0 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer touch-manipulation text-sm"
              >
                {t('cancel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

