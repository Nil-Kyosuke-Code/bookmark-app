/*
ブックマーク追加フォーム(URLを入力して保存するコンポーネント)
*/
"use client";

import { useState } from "react";

export default function AddBookmarkForm() {
  // 入力されたURLを保存する変数
  const [url, setUrl] = useState("");
  // 送信中かどうかを管理
  const [isLoading, setIsLoading] = useState(false);

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ

    if (!url) return; // URLが空なら何もしない

    setIsLoading(true); // 送信中にする

    try {
      // APIにブックマークを保存するリクエストを送る
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        setUrl(""); // 成功したら入力欄をクリア
        alert("ブックマークを追加しました！");
        window.location.reload(); // ページをリロードして一覧を更新
      } else {
        alert("エラーが発生しました");
      }
    } catch (error) {
      console.error("エラーが発生しました");
    } finally {
      setIsLoading(false); // 送信完了
    }
  };

  return (
    <form onSubmit={handleSubmit} className="md-6">
      <div className="flex gap-2">
        {/* URL入力欄 */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        {/* 追加ボタン */}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? "追加中" : "追加"}
        </button>
      </div>
    </form>
  );
}
