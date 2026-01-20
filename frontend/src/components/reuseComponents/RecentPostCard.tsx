"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export const RecentPostCard = ({ post }: any) => {
  const t = useTranslations('feed');
  
  return (
    <div className="mb-4 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors" >
      <div className="flex items-start gap-2 mb-2">
        <Image src={post.avatar} alt={post.community} className="w-5 h-5 rounded-full" />
        <div className="flex-1">
          <span className="text-xs text-gray-600">
            {post.community} • {post.timestamp}
          </span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-900 mb-2">
        {post.title}
      </p>
      <div className="flex items-center gap-3 text-xs text-gray-500">
        <span>{post.upvotes} {t('upvotes')}</span>
        <span>{post.comments} {t('comments')}</span>
      </div>
    </div>
  );
};