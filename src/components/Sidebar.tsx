"use client";

import { useEffect, useState } from "react";
import {
  FolderOpen,
  Plus,
  Settings,
  User,
  Bell,
  Home,
  ChevronRight,
  ChevronDown,
  MoreVertical,
} from "lucide-react";
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
  onFolderUpdate: () => void;
};

export default function AppSidebar({
  selectedFolderId,
  onSelectFolder,
  onFolderUpdate,
}: Props) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingFolder, setEditingFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [editFolderName, setEditFolderName] = useState("");

  // フォルダ一覧を取得
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

  useEffect(() => {
    fetchFolders();
  }, []);

  // フォルダ名を編集
  const handleEditFolder = async () => {
    if (!editingFolder || !editFolderName.trim()) return;

    try {
      const response = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editFolderName }),
      });

      if (response.ok) {
        fetchFolders();
        onFolderUpdate();
        setEditingFolder(null);
        setEditFolderName("");
      } else {
        alert("フォルダ名の変更に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // フォルダを削除
  const handleDeleteFolder = async (id: string) => {
    if (!confirm("このフォルダを削除しますか？")) return;

    try {
      const response = await fetch(`/api/folders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFolders();
        onFolderUpdate();
        setOpenMenuId(null);
        alert("削除しました");
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
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
    <div className="fixed left-0 top-16 h-[calc(100vh-64px)] w-64 bg-white shadow-lg border-r border-gray-200 overflow-y-auto z-40">
      <div className="p-4">
        {/* メインメニュー */}
        <nav className="space-y-1">
          {/* ブックマーク一覧 */}
          <button
            onClick={() => onSelectFolder(null)}
            className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-3 ${
              selectedFolderId === null && !isFolderOpen
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            <Home className="w-5 h-5" />
            <span>一覧</span>
          </button>

          {/* フォルダ（アコーディオン） */}
          <div>
            <button
              onClick={() => setIsFolderOpen(!isFolderOpen)}
              className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 text-gray-700"
            >
              <FolderOpen className="w-5 h-5" />
              <span className="flex-1">フォルダ</span>
              {isFolderOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>

            {/* フォルダが開いた時の中身 */}
            {isFolderOpen && (
              <div className="ml-8 mt-1 space-y-1">
                {/* 新規フォルダ作成 */}
                {showNewFolderInput ? (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateFolder()
                      }
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

                {/* すべて表示 */}
                <button
                  onClick={() => onSelectFolder(null)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
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
                  <div key={folder.id} className="mb-2 group relative">
                    <div
                      className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 ${
                        selectedFolderId === folder.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-100 text-gray-700"
                      }`}
                    >
                      <button
                        onClick={() => onSelectFolder(folder.id)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <FolderOpen className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-1 truncate">{folder.name}</span>
                      </button>

                      {/* 3点メニューボタン */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === folder.id ? null : folder.id
                          );
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>

                    {/* メニュー */}
                    {openMenuId === folder.id && (
                      <div className="absolute right-0 top-8 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingFolder({
                              id: folder.id,
                              name: folder.name,
                            });
                            setEditFolderName(folder.name);
                            setOpenMenuId(null);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          名前を編集
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder.id);
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          削除
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 設定 */}
          <button className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 text-gray-700">
            <Settings className="w-5 h-5" />
            <span>設定</span>
          </button>

          {/* プロフィール */}
          <button className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 text-gray-700">
            <User className="w-5 h-5" />
            <span>プロフィール</span>
          </button>

          {/* 通知 */}
          <button className="w-full text-left px-3 py-2 rounded-md flex items-center gap-3 hover:bg-gray-100 text-gray-700">
            <Bell className="w-5 h-5" />
            <span>通知</span>
          </button>
        </nav>

        {/* フォルダ各編集モーダル */}
        {editingFolder && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">フォルダ名を編集</h3>

              <input
                type="text"
                value={editFolderName}
                onChange={(e) => setEditFolderName(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                autoFocus
              />

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditingFolder(null);
                    setEditFolderName("");
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                >
                  キャンセル
                </button>

                <button
                  onClick={handleEditFolder}
                  className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
