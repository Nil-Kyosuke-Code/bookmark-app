"use client";

import { useEffect, useState } from "react";
import { FolderOpen, Plus, Menu, X, MoreVertical } from "lucide-react";
type Folder = {
  id: string;
  name: string;
  isSecret: boolean;
  _count: {
    bookmark: number;
  };
};

type Props = {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

export default function FolderSidebar({
  selectedFolderId,
  onSelectFolder,
  isOpen,
  setIsOpen,
}: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // フォルダ一覧を取得
  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await fetch("/api/folders");
      if (response.ok) {
        const data = await response.json();
        setFolders(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // フォルダを作成
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newFolderName }),
      });

      if (response.ok) {
        fetchFolders();
        setNewFolderName("");
        setShowNewFolderInput(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {/* トグルボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-[120px] z-50 p-2 text-gray-700 bg-white rounded-full shadow-lg hover:bg-gray-100"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* サイドバー */}
      <div
        className={`fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto z-40 transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">フォルダ</h3>

          {/* すべて表示 */}
          <button
            onClick={() => onSelectFolder(null)}
            className={`w-full text-left px-3 py-2 rounded-md mb-2 flex items-center gap-2 ${
              selectedFolderId === null
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            すべて
          </button>

          {/* フォルダ一覧 */}
          {folders.map((folder) => (
            <div key={folder.id} className="mb-2">
              <button
                onClick={() => onSelectFolder(folder.id)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                  selectedFolderId === folder.id
                    ? "bg-blue-50 text-blue-600"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                <FolderOpen className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1 truncate">{folder.name}</span>
              </button>
            </div>
          ))}

          {/* 新規フォルダ作成 */}
          {showNewFolderInput ? (
            <div className="mt-2">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                placeholder="フォルダ名"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-2"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderInput(false);
                    setNewFolderName("");
                  }}
                  className="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolderInput(true)}
              className="w-full text-left px-3 py-2 rounded-md flex items-center gap-2 text-gray-600 hover:bg-gray-100"
            >
              <Plus className="w-4 h-4" />
              新規フォルダ
            </button>
          )}
        </div>
      </div>
    </>
  );
}
