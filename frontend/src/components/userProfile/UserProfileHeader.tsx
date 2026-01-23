'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { User } from '@/lib/api';
import { formatTimestamp } from '@/utils/helperFunction';
import { FiEdit, FiCamera, FiUserX } from 'react-icons/fi';
import DP from '../../../public/assets/images/avatar_default_4.png';
import { usersApi, s3Api } from '@/lib/api';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
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
      alert(err.message || 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="relative">
          {isUploadingAvatar ? (
            <div className="w-24 h-24 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Uploading...</div>
            </div>
          ) : (
            <Image
              src={user.avatar || DP}
              alt={user.nickname}
              className="w-24 h-24 rounded-full border-2 border-gray-300 object-cover"
              width={96}
              height={96}
              unoptimized={!!user.avatar}
            />
          )}
          {isOwnProfile && !isUploadingAvatar && (
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
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
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2 justify-between">
            <div className="flex items-center gap-3">
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.nickname}
                  onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                  className="text-3xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900">{user.nickname}</h1>
              )}
              {!isOwnProfile && isBlocked && (
                <span className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-full flex items-center gap-1">
                  <FiUserX size={14} />
                  {t('blockedUser')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isOwnProfile && currentUser && (
                <>
                  {isBlocked ? (
                    <button
                      onClick={onUnblockClick}
                      disabled={isBlocking}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <FiUserX size={16} />
                      <span>{isBlocking ? t('processing') : t('unblockUser')}</span>
                    </button>
                  ) : (
                    <button
                      onClick={onBlockClick}
                      disabled={isCheckingBlock || isBlocking}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
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
                  className="flex items-center gap-2 px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <FiEdit size={16} />
                  <span>{t('edit')}</span>
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-600 mb-4">{user.email}</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>{t('memberSince')}: {formatTimestamp(user.createdAt)}</span>
            <span className="capitalize">{user.role}</span>
            <span className="uppercase">{user.language}</span>
          </div>
          {isEditing && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleSaveEdit}
                className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
              >
                {t('save')}
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-2 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
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

