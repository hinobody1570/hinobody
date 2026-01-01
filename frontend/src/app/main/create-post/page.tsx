"use client";

import React, { useState } from "react";
import { BiChevronDown } from "react-icons/bi";
import { Tab } from "@/components/reuseComponents/Tabs";
import RichTextEditor from "@/components/reuseComponents/RichTextEditor";

// Main Create Post Component
const CreatePost = () => {
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const tabs = [
    { id: "text", label: "Text" },
    { id: "images", label: "Images & Video" },
    { id: "link", label: "Link" },
    { id: "poll", label: "Poll", disabled: true },
  ];

  const handlePost = () => {
    console.log("Posting:", { title, body, community: selectedCommunity });
    // Add your post logic here
  };

  const handleSaveDraft = () => {
    console.log("Saving draft:", { title, body, community: selectedCommunity });
    // Add your save draft logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create post</h1>
          <button className="text-sm text-gray-600 hover:text-gray-800 font-semibold">Drafts</button>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Community Selector */}
          <div className="p-6 pb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              <div className="w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">r</span>
              </div>
              <span className="text-sm font-semibold text-gray-700">{selectedCommunity || "Select a community"}</span>
              <BiChevronDown size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-6 border-b border-gray-200">
            <div className="flex gap-12">
              {tabs.map((tab) => (
                <Tab key={tab.id} label={tab.label} active={activeTab === tab.id} onClick={() => !tab.disabled && setActiveTab(tab.id)} />
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {/* Title Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Title*"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={300}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-400"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-gray-500">{title.length}/300</span>
              </div>
            </div>

            {/* Tags Button */}
            <button
              className="mb-4 px-4 py-2 bg-gray-100 text-gray-500 text-sm rounded-full hover:bg-gray-200 transition-colors"
            >
              Add tags
            </button>

            {/* Rich Text Editor */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <RichTextEditor value={body} onChange={(e: any) => setBody(e.target.value)} />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={handleSaveDraft}
                className="px-6 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
              >
                Save Draft
              </button>
              <button
                onClick={handlePost}
                disabled={!title.trim()}
                className={`px-8 py-2 text-sm font-semibold rounded-full transition-colors ${
                  title.trim() ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                Post
              </button>
            </div>
          </div>
        </div>

        {/* Guidelines Card */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-800 mb-3">Posting Guidelines</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Remember the human</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Behave like you would in real life</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Look for the original source of content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Search for duplicates before posting</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-400">•</span>
              <span>Read the community's rules</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
