"use client";

import { useCallback, useEffect, useState } from "react";
import AddBookmarkForm from "./AddBookmarkForm";
import BookmarkList from "./BookmarkList";
import AppSidebar from "./Sidebar";
import { FolderOpen } from "lucide-react";

export default function DashboardClient() {
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [folders, setFolders] = useState<any[]>([]);

  // フォルダを取得する
  const fetchFolders = useCallback(async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <>
      {/* サイドバー */}
      <AppSidebar
        selectedFolderId={selectedFolderId}
        onSelectFolder={setSelectedFolderId}
        onFolderUpdate={fetchFolders}
      />

      {/* メインコンテンツ */}
      <main
        className={`max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 transition-all duration-300 pt-16 ${
          isSidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <div className="bg-white rounded-lg shadow p-6">
          {/* フォルダ名表示 */}
          {selectedFolderId && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex item-center gap-2">
                <FolderOpen className="w-6 h-6" />
                {folders.find((f) => f.id === selectedFolderId)?.name ||
                  "フォルダ"}
              </h2>
            </div>
          )}

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
