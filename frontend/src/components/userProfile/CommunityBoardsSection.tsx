'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Board } from '@/lib/api';
import { ROUTE_PATHS } from '@/routes/paths';
import { formatTimestamp } from '@/utils/helperFunction';
import { FaUsers } from 'react-icons/fa';

interface CommunityBoardsSectionProps {
  createdBoards: Board[];
  memberBoards: Board[];
  loading: boolean;
}

export function CommunityBoardsSection({
  createdBoards,
  memberBoards,
  loading,
}: CommunityBoardsSectionProps) {
  const t = useTranslations('userProfile');
  const tTime = useTranslations('timeAgo');
  const router = useRouter();

  return (
    <div className="mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <FaUsers size={24} className="flex-shrink-0" />
        <span>{t('communityBoards')}</span>
      </h2>
      
      {loading ? (
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
          <div className="text-gray-500 text-sm sm:text-base">{t('loading')}</div>
        </div>
      ) : createdBoards.length > 0 || memberBoards.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {/* Created Boards */}
          {createdBoards.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                {t('createdBoards')} ({createdBoards.length})
              </h3>
              <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {createdBoards.map((board : any) => (
                    <div
                      key={board.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
                      onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate min-w-0">r/{board.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                          {t('creator')}
                        </span>
                      </div>
                      {board.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                        <span>{t('category')}: {board.category?.name || '-'}</span>
                        <span>•</span>
                        <span>{formatTimestamp(board.createdAt, tTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Member Boards */}
          {memberBoards.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
                {t('memberBoards')} ({memberBoards.length})
              </h3>
              <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-5 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {memberBoards.map((board :any) => (
                    <div
                      key={board.id}
                      className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow cursor-pointer touch-manipulation"
                      onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 truncate min-w-0">r/{board.name}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                          {t('member')}
                        </span>
                      </div>
                      {board.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                        <span>{t('category')}: {board.category?.name || '-'}</span>
                        <span>•</span>
                        <span>{formatTimestamp(board.createdAt, tTime)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 text-center">
          <p className="text-gray-500 text-sm sm:text-base">{t('noBoards')}</p>
        </div>
      )}
    </div>
  );
}

