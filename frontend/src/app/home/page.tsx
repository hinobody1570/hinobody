import RedditFeed from "@/components/feedSection/FeedSection";
import RedditSidebar from "@/components/sidebar/Sidebar";
import { RedditHeader } from "@/components/topHeader/TopHeader";
import React from "react";

const HEADER_HEIGHT = "64px"; // match your header height

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <RedditHeader />

      {/* Main Layout */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside
          className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto"
        >
          <RedditSidebar />
        </aside>

        {/* Feed */}
        <main className="flex-1 px-6 py-4">
          <RedditFeed />
        </main>
      </div>
    </div>
  );
};

export default HomePage;
