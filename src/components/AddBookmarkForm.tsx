/*
ブックマーク追加フォーム(URLとタグを入力して保存するコンポーネント)
*/
"use client";

import { useState } from "react";

export default function AddBookmarkForm() {
  // 入力されたURLを保存する変数
  const [url, setUrl] = useState("");
  // 入力されたタグを保存する変数(カンマ区切り)
  const [tags, setTags] = useState("");
  // 送信中かどうかを管理
  const [isLoading, setIsLoading] = useState(false);

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ

    if (!url) return; // URLが空なら何もしない

    setIsLoading(true); // 送信中にする

    try {
      // タグをカンマで分割して配列にする
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim()) // 前後の空白を削除
        .filter((tag) => tag.length > 0); // 空のタグを除外

      // メタ情報を取得
      const metaResponse = await fetch("/api/meta", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      let metaData = { title: null, description: null, imageUrl: null };
      if (metaResponse.ok) {
        metaData = await metaResponse.json();
      }

      // メタ情報と一緒にブックマークを保存する
      const bookmarkResponse = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          tags: tagArray,
          title: metaData.title,
          description: metaData.description,
          imageUrl: metaData.imageUrl,
        }),
      });

      if (bookmarkResponse.ok) {
        setUrl(""); // 成功したら入力欄をクリア
        setTags("");
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* URL入力欄 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          URL
        </label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      {/* タグ入力欄 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タグ（カンマ区切り）
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="React, Next.js, 開発"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          例: React, Next.js, TypeScript
        </p>
      </div>

      {/* 追加ボタン */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isLoading ? "追加中" : "追加"}
      </button>
    </form>
  );
}
