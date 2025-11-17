/*
保存したブックマークを表示するコンポーネント(ブックマーク一覧)

ブックマーク一覧を取得して表示
削除ボタンで削除できる
0件の時は「まだありません」と表示
読み込み中は「読み込み中...」と表示
*/
// ブックマーク一覧
// 保存したブックマークを表示するコンポーネント
"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Star } from "lucide-react";

// ブックマークの型定義
type Bookmark = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function BookmarkList() {
  // ブックマーク一覧を保存する変数
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // 読み込み中かどうか
  const [isLoading, setIsLoading] = useState(true);

  // 選択中のタグ(フィルター用)
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 開いてるメニューのブックマークID
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 編集中のブックマーク
  const [editingBookmark, setEditingBookmark] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // 編集中のタイトル
  const [editTitle, setEditTitle] = useState("");

  // コンポーネントが表示されたときにブックマークを取得
  useEffect(() => {
    fetchBookmarks();
  }, []);

  // 全てのタグを重複なしで取得する関数
  const getAllTags = () => {
    // 全てのブックマークからタグを取り出す
    const allTags = bookmarks.flatMap((bookmark) => bookmark.tags);
    return Array.from(new Set(allTags)); // 重複を削除し、ユニークなタグだけにする
  };

  // 表示するブックマークをフィルターする関数
  const getFilteredBookmarks = () => {
    // タグが選択されてなければ、全部表示
    if (!selectedTag) return bookmarks;

    // お気に入りフィルター
    if (selectedTag === "favorites") {
      return bookmarks.filter((bookmark) => bookmark.isFavorite);
    }

    // タグフィルター(選択したタグを持つもののみ表示)
    return bookmarks.filter((bookmark) => bookmark.tags.includes(selectedTag));
  };

  // ブックマークを取得する関数
  const fetchBookmarks = async () => {
    try {
      const response = await fetch("/api/bookmarks");
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ブックマークを削除する関数
  const handleDelete = async (id: string) => {
    if (!confirm("このブックマークを削除しますか？")) return;

    try {
      const response = await fetch(`/api/bookmarks/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // 削除成功したら一覧から削除
        setBookmarks(bookmarks.filter((bookmark) => bookmark.id !== id));
        alert("削除しました");
      } else {
        alert("削除に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // お気に入りを切り替える関数
  const handleToggleFavorite = async (id: string) => {
    try {
      // PATCHリクエストを送る
      const response = await fetch(`/api/bookmarks/${id}/favorite`, {
        method: "PATCH",
      });

      if (response.ok) {
        // 成功したら一覧を再取得
        fetchBookmarks();
      } else {
        alert("お気に入りの切り替えに失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // 編集モーダルを開く
  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark({ id: bookmark.id, title: bookmark.title || "" });
    setEditTitle(bookmark.title || "");
    setOpenMenuId(null); // メニューを閉じる
  };

  // タイトルを保存
  const handleSaveTitle = async () => {
    if (!editingBookmark) return;

    try {
      const response = await fetch(
        `/api/bookmarks/${editingBookmark.id}/title`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: editTitle.trim() }),
        }
      );

      if (response.ok) {
        // 成功したら一覧を再取得
        fetchBookmarks();
        setEditingBookmark(null);
        setEditTitle("");
      } else {
        alert("タイトルの取得に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // 編集をキャンセル
  const cancelEdit = () => {
    setEditingBookmark(null);
    setEditTitle("");
  };

  // 読み込み中の表示
  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  // ブックマークが0件の場合
  if (getFilteredBookmarks().length === 0 && !selectedTag) {
    return (
      <div className="text-center py-8 text-gray-500">
        ブックマークがまだありません。
        <br />
        上のフォームからURLを追加してみましょう！
      </div>
    );
  }

  // ブックマーク一覧を表示
  return (
    <div className="space-y-4">
      {/* タグフィルター */}
      {getAllTags().length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              タグで絞り込み
            </h3>

            {/* お気に入りフィルター */}
            <button
              onClick={() =>
                setSelectedTag(selectedTag === "favorites" ? null : "favorites")
              }
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full ${
                selectedTag === "favorites"
                  ? "bg-yellow-400 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <Star className="w-4 h-4" />
              お気に入りのみ
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* すべて表示ボタン */}
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedTag === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              すべて表示
            </button>

            {/* タグボタン */}
            {getAllTags().map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 text-sm rounded-full ${
                  selectedTag === tag
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {getFilteredBookmarks().map((bookmark) => (
        <div
          key={bookmark.id}
          className="bg-white rounded-lg shadow border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden"
        >
          <div className="flex items-center">
            {/* サムネイル画像 */}
            {bookmark.imageUrl && (
              <div className="w-48 h-32 flex-shrink-0 ml-4">
                <img
                  src={bookmark.imageUrl}
                  alt={bookmark.title || "サムネイル"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* コンテンツ部分 */}
            <div className="flex-1 p-4">
              {/* タイトル・お気に入り・メニュー */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 flex-1">
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-blue-600"
                  >
                    {bookmark.title || bookmark.url}
                  </a>
                </h3>

                {/* お気に入りボタン */}
                <button
                  onClick={() => handleToggleFavorite(bookmark.id)}
                  className="hover:scale-110 transition-transform"
                  title={
                    bookmark.isFavorite ? "お気に入り解除" : "お気に入りに追加"
                  }
                >
                  <Star
                    className={`w-6 h-6 ${
                      bookmark.isFavorite
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* 3点ドットメニュー */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setOpenMenuId(
                        openMenuId === bookmark.id ? null : bookmark.id
                      )
                    }
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>

                  {/* メニュー */}
                  {openMenuId === bookmark.id && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => openEditModal(bookmark)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        タイトルを編集
                      </button>
                      <button
                        onClick={() => {
                          setOpenMenuId(null);
                          handleDelete(bookmark.id);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        削除
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 説明 */}
              {bookmark.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {bookmark.description}
                </p>
              )}

              {/* URL */}
              <p className="text-xs text-gray-400 mb-2 truncate">
                {bookmark.url}
              </p>

              {/* タグ */}
              {bookmark.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {bookmark.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* 追加日と削除ボタン */}
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  追加日:{" "}
                  {new Date(bookmark.createdAt).toLocaleDateString("ja-JP")}
                </p>
                <button
                  onClick={() => handleDelete(bookmark.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* タイトル編集モーダル */}
      {editingBookmark && (
        <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">タイトルを編集</h3>

            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="タイトルを入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelEdit}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSaveTitle}
                className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
