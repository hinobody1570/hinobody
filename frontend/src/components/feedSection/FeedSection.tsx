"use client";

import React from "react";
import POST_1 from "./../../../public/assets/images/post_1.webp";
import POST_2 from "./../../../public/assets/images/post_2.webp";
import POST_3 from "./../../../public/assets/images/post_3.webp";
import POST_4 from "./../../../public/assets/images/post_4.png";
import DP from "./../../../public/assets/images/avatar_default_4.png";
import { IoChevronDown } from "react-icons/io5";
import { CiCalendar } from "react-icons/ci";
import { PostCard } from "../reuseComponents/PostCard";
import { RecentPostCard } from "../reuseComponents/RecentPostCard";

const dummyPosts = [
  {
    id: 1,
    community: "r/pakistan",
    communityAvatar: DP,
    verified: true,
    timestamp: "15 hr. ago",
    title: "Found in the wild",
    image: POST_1,
    upvotes: 109,
    comments: 25,
  },
  {
    id: 2,
    community: "r/Pakistani_Art",
    communityAvatar: DP,
    verified: false,
    timestamp: "3 days ago",
    badge: "Popular near you",
    title: "MADE THIS PAINTING A YEAR AGO......",
    image: POST_2,
    upvotes: 342,
    comments: 48,
  },
  {
    id: 3,
    community: "r/technology",
    communityAvatar: DP,
    verified: true,
    timestamp: "8 hr. ago",
    title: "New AI breakthrough changes everything we know",
    image: POST_3,
    upvotes: 2547,
    comments: 389,
  },
  {
    id: 4,
    community: "r/nature",
    communityAvatar: DP,
    verified: false,
    timestamp: "12 hr. ago",
    title: "Captured this beautiful sunset today",
    image: POST_4,
    upvotes: 876,
    comments: 92,
  },
];

const recentPosts = [
  {
    id: 1,
    community: "r/FarmMergeValley",
    avatar: DP,
    timestamp: "5d ago",
    title: "Don't miss your daily reward! 🎁",
    upvotes: 731,
    comments: "1.7K",
  },
  {
    id: 2,
    community: "r/gaming",
    avatar: DP,
    timestamp: "2d ago",
    title: "Best indie games of 2024",
    upvotes: 1243,
    comments: "2.3K",
  },
  {
    id: 3,
    community: "r/photography",
    avatar: DP,
    timestamp: "1d ago",
    title: "Tips for beginners in landscape photography",
    upvotes: 456,
    comments: "892",
  },
];

export const RedditFeed = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4" style={{ padding: "4px", margin: "0 auto" }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Sort Options */}
            <div className="flex items-center gap-2 mb-4" style={{ marginBottom: "4px" }}>
              <button
                style={{ padding: "8px" }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-semibold">Best</span>
                <IoChevronDown size={16} />
              </button>
              <button
                style={{ padding: "8px" }}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <CiCalendar size={16} />
                <IoChevronDown size={16} />
              </button>
            </div>

            {/* Posts */}
            {dummyPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Sidebar - Recent Posts */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-300 rounded-lg p-4 sticky top-8" style={{ padding: "20px" }}>
              <div className="flex items-center justify-between mb-4" style={{ marginBottom: "10px" }}>
                <h3 className="text-sm font-semibold text-gray-600 uppercase">Recent Posts</h3>
                <button className="text-sm text-blue-600 hover:underline font-semibold">Clear</button>
              </div>

              <div className="space-y-2">
                {recentPosts.map((post) => (
                  <RecentPostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Footer Links */}
              <div className="mt-6 pt-4 border-t border-gray-200" style={{ paddingTop: "6px" }}>
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3" style={{ margin: "4px" }}>
                  <a href="#" className="hover:underline">
                    Reddit Rules
                  </a>
                  <a href="#" className="hover:underline">
                    Privacy Policy
                  </a>
                  <a href="#" className="hover:underline">
                    User Agreement
                  </a>
                  <a href="#" className="hover:underline">
                    Accessibility
                  </a>
                </div>
                <p className="text-xs text-gray-500">Reddit, Inc. © 2025. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RedditFeed;
