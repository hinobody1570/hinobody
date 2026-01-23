'use client';

import { useTranslations } from 'next-intl';

interface BlockUserModalProps {
  isOpen: boolean;
  userName: string;
  isBlocking: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockUserModal({
  isOpen,
  userName,
  isBlocking,
  onClose,
  onConfirm,
}: BlockUserModalProps) {
  const t = useTranslations('userProfile');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">{t('confirmBlockUser')}</h3>
        <p className="text-gray-600 mb-6">
          {t('confirmBlockUserMessage', { name: userName })}
        </p>
        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors cursor-pointer"
          >
            {t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={isBlocking}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isBlocking ? t('processing') : t('confirmBlock')}
          </button>
        </div>
      </div>
    </div>
  );
}

