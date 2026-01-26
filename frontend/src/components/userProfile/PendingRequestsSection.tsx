'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { BoardMembership } from '@/lib/api';
import { formatTimestamp } from '@/utils/helperFunction';
import { FiCheck, FiX } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';

interface PendingRequestsSectionProps {
  requests: BoardMembership[];
  loading: boolean;
  onApprove: (membershipId: string) => void;
  onReject: (membershipId: string) => void;
}

export function PendingRequestsSection({
  requests,
  loading,
  onApprove,
  onReject,
}: PendingRequestsSectionProps) {
  const t = useTranslations('userProfile');

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaUsers size={24} />
        <span>{t('pendingRequests')} ({requests.length})</span>
      </h2>
      
      {loading ? (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      ) : requests.length > 0 ? (
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                        {request.user?.avatar ? (
                          <Image
                            src={request.user.avatar}
                            alt={request.user.nickname}
                            width={40}
                            height={40}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="text-gray-600 font-semibold">
                            {request.user?.nickname?.[0]?.toUpperCase() || 'U'}
                          </span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{request.user?.nickname}</h4>
                        <p className="text-sm text-gray-500">{request.user?.email}</p>
                      </div>
                    </div>
                    <div className="ml-13">
                      <p className="text-sm text-gray-600 mb-1">
                        {t('wantsToJoin')} <span className="font-semibold">r/{request.board?.name}</span>
                      </p>
                      {request.board?.description && (
                        <p className="text-xs text-gray-500 mb-2">{request.board.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {t('requestedAt')}: {formatTimestamp(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onApprove(request.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                    >
                      <FiCheck size={16} />
                      <span>{t('approve')}</span>
                    </button>
                    <button
                      onClick={() => onReject(request.id)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer"
                    >
                      <FiX size={16} />
                      <span>{t('reject')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t('noPendingRequests')}</p>
        </div>
      )}
    </div>
  );
}

