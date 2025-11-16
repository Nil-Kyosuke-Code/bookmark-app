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

  // コンポーネントが表示されたときにブックマークを取得
  useEffect(() => {
    fetchBookmarks();
  }, []);

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

  // 読み込み中の表示
  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  // ブックマークが0件の場合
  if (bookmarks.length === 0) {
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
      {bookmarks.map((bookmark) => (
        <div
          key={bookmark.id}
          className="p-4 bg-white rounded-lg shadow border border-gray-200 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            {/* URL表示 */}
            <div className="flex-1">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium break-all"
              >
                {bookmark.url}
              </a>

              <p className="text-sm text-gray-500 mt-1">
                追加日:{" "}
                {new Date(bookmark.createdAt).toLocaleDateString("ja-JP")}
              </p>
            </div>

            {/* 削除ボタン */}
            <button
              onClick={() => handleDelete(bookmark.id)}
              className="ml-4 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
            >
              削除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
