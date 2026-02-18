'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { BoardMembership } from '@/lib/api';
import { formatTimestamp } from '@/utils/helperFunction';
import { FiX } from 'react-icons/fi';
import { FaUsers } from 'react-icons/fa';
import { ROUTE_PATHS } from '@/routes/paths';

interface PendingRequestsSectionProps {
  requests: BoardMembership[];
  loading: boolean;
  onApprove: (membershipId: string) => void;
  onReject: (membershipId: string) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export function PendingRequestsSection({
  requests,
  loading,
  onReject,
}: PendingRequestsSectionProps) {
  const t = useTranslations('userProfile');
  const tTime = useTranslations('timeAgo');
  const router = useRouter();

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <FaUsers size={24} className="flex-shrink-0" />
        <span>{t('myBoardMemberships') || 'My Board Memberships'} ({requests.length})</span>
      </h2>
      
      {loading ? (
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
          <div className="text-gray-500 text-sm sm:text-base">{t('loading')}</div>
        </div>
      ) : requests.length > 0 ? (
        <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 md:p-6">
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => request.board?.id && router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${request.board.id}`)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                        <span className="text-white font-semibold text-sm sm:text-base">r</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 truncate">r/{request.board?.name || 'Unknown'}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${statusStyles[request.status] || 'bg-gray-100 text-gray-800'}`}>
                            {request.status}
                          </span>
                        </div>
                        {request.board?.visibilityAccess && (
                          <p className="text-xs sm:text-sm text-gray-500 truncate capitalize">{request.board.visibilityAccess.toLowerCase()}</p>
                        )}
                      </div>
                    </div>
                    <div className="sm:ml-12 mt-1">
                      {request.board?.description && (
                        <p className="text-xs text-gray-500 mb-1 sm:mb-2 line-clamp-2">{request.board.description}</p>
                      )}
                      {request.board?.creator && (
                        <p className="text-xs text-gray-500 mb-1">
                          {t('boardCreator') || 'Board Creator'}: {request.board.creator.nickname}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {t('joinedAt') || 'Joined at'}: {formatTimestamp(request.createdAt, tTime)}
                      </p>
                      {request.status === 'PENDING' && (
                        <p className="text-xs text-yellow-600 mt-1 font-medium">
                          {t('waitingForApproval') || 'Waiting for board admin approval'}
                        </p>
                      )}
                    </div>
                  </div>
                  {request.status === 'PENDING' && (
                    <div className="flex items-center gap-2 flex-shrink-0 sm:ml-4" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onReject(request.id)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 py-2 min-h-[40px] sm:min-h-0 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors cursor-pointer touch-manipulation text-sm"
                      >
                        <FiX size={16} />
                        <span>{t('cancel') || 'Cancel Request'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">{t('noBoardMemberships') || 'No board memberships yet'}</p>
        </div>
      )}
    </div>
  );
}

