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
  const router = useRouter();

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <FaUsers size={24} />
        <span>{t('communityBoards')}</span>
      </h2>
      
      {loading ? (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <div className="text-gray-500">{t('loading')}</div>
        </div>
      ) : createdBoards.length > 0 || memberBoards.length > 0 ? (
        <div className="space-y-6">
          {/* Created Boards */}
          {createdBoards.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('createdBoards')} ({createdBoards.length})
              </h3>
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {createdBoards.map((board : any) => (
                    <div
                      key={board.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">r/{board.name}</h4>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {t('creator')}
                        </span>
                      </div>
                      {board.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{t('category')}: {board.category}</span>
                        <span>•</span>
                        <span>{formatTimestamp(board.createdAt)}</span>
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
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                {t('memberBoards')} ({memberBoards.length})
              </h3>
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {memberBoards.map((board :any) => (
                    <div
                      key={board.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => router.push(`${ROUTE_PATHS.BOARD_PROFILE}/${board.id}`)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900">r/{board.name}</h4>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {t('member')}
                        </span>
                      </div>
                      {board.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{board.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{t('category')}: {board.category}</span>
                        <span>•</span>
                        <span>{formatTimestamp(board.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500">{t('noBoards')}</p>
        </div>
      )}
    </div>
  );
}

