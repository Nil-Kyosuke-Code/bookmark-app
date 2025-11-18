"use client";

import { useState } from "react";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkList from "./BookmarkList";
import FolderSidebar from "./FolderSidebar";

export default function DashboardClient() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* サイドバー */}
      <FolderSidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* メインコンテンツ */}
      <main
        className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            ブックマークを追加
          </h2>

          <AddBookmarkForm />

          <hr className="my-6" />

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            保存したブックマーク
          </h2>

          <BookmarkList selectedFolderId={selectedFolderId} />
        </div>
      </main>
    </>
  );
}
