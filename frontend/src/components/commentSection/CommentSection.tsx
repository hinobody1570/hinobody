import { useState } from 'react';
import { BiChevronDown, BiSearch } from 'react-icons/bi';
import Comment from './Comment';

// Main Comments Section Component
export const CommentsSection = () => {
  const [sortBy, setSortBy] = useState('Best');

  const dummyComments = [
    {
      id: 1,
      username: 'AutoModerator',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=automod',
      badge: 'MOD',
      timestamp: '1d ago',
      text: '',
      upvotes: 0,
      stickied: true,
      replies: []
    },
    {
      id: 2,
      username: 'SoggyVolume1556',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=soggy',
      badge: 'OP',
      timestamp: '1d ago',
      text: '"The war will end, and leaders will shake hands. That old woman will keep waiting for her martyred son. And those children will keep waiting for their hero father. I don\'t know who sold our homeland, but I saw who paid the price." This quote is so true it\'s ironic',
      upvotes: 369,
      awards: 2,
      highlighted: true,
      replies: [
        {
          id: 3,
          username: 'GootuSnotborn',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=gootu',
          timestamp: '21h ago',
          edited: true,
          editedTime: '20h ago',
          text: 'This is by Mahmoud Darwish the Palestinian poet.\n\nEdit: spelling',
          upvotes: 54,
          replies: [
            {
              id: 4,
              username: 'SoggyVolume1556',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=soggy',
              badge: 'OP',
              timestamp: '21h ago',
              text: 'Yes it isss',
              upvotes: 13,
              replies: []
            }
          ]
        },
        {
          id: 5,
          username: 'Attila___',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=attila',
          timestamp: '1d ago',
          text: 'So true 😢',
          upvotes: 14,
          replies: []
        }
      ]
    },
    {
      id: 6,
      username: 'eight_BUCKS',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=eight',
      timestamp: '1d ago',
      text: 'Handshakes are back?',
      upvotes: 36,
      replies: []
    }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-6">

      {/* Comment Input */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Join the conversation"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
        />
      </div>

      {/* Sort and Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-gray-800 hover:bg-gray-100 rounded transition-colors"
            onClick={() => setSortBy('Best')}
          >
            {sortBy}
            <BiChevronDown size={16} />
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <BiSearch size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Comments"
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {dummyComments.map((comment) => (
          <Comment key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};