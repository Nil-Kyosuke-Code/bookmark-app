/*
ブックマーク追加フォーム(URLとタグを入力して保存するコンポーネント)
*/
"use client";

import { useEffect, useState } from "react";

export default function AddBookmarkForm() {
  // 入力されたURLを保存する変数
  const [url, setUrl] = useState("");

  // 入力されたタグを保存する変数(カンマ区切り)
  const [tags, setTags] = useState("");

  // カスタムタイトル(オプション)
  const [customTitle, setCustomTitle] = useState("");

  // 送信中かどうかを管理
  const [isLoading, setIsLoading] = useState(false);

  // 既存の全タグ(候補用)
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // タグを表示するか
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);

  // 既存のタグを取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/bookmarks");
        if (response.ok) {
          const bookmarks = await response.json();
          // 全てのブックマークからタグを取り出して重複削除
          const allTags = bookmarks.flatMap((b: any) => b.tags);
          const uniqueTags: string[] = Array.from(new Set(allTags));
          setAvailableTags(uniqueTags);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTags();
  }, []);

  // フォーム送信時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ

    if (!url) return; // URLが空なら何もしない

    setIsLoading(true); // 送信中にする

    try {
      // タグをカンマで分割して配列にする
      const tagArray = tags
        .split(/[,、]/) // 正規表現で , と 、 両方で分割
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
          title: customTitle.trim() || metaData.title,
          description: metaData.description,
          imageUrl: metaData.imageUrl,
        }),
      });

      if (bookmarkResponse.ok) {
        setUrl(""); // 成功したら入力欄をクリア
        setTags("");
        setCustomTitle("");
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
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      {/* カスタムタイトル入力欄 */}
      <div>
        <label className="block text-sum font-medium text-gray-700 md-1">
          タイトル
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => setCustomTitle(e.target.value)}
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          空白の場合、タイトルが自動取得されます
        </p>
      </div>

      {/* タグ入力欄 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          タグ
        </label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          onFocus={() => setShowTagSuggestions(true)}
          onBlur={() => setTimeout(() => setShowTagSuggestions(false), 200)}
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* タグ候補 */}
        {showTagSuggestions && availableTags.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
            {availableTags
              .filter((tag) => {
                // 現在入力中のタグを配列に変換
                const currentTags = tags
                  .split(/[,、]/)
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0);

                // 入力済みのタグは除外
                return !currentTags.includes(tag);
              })

              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    // 既存のタグに追加
                    if (!tags) {
                      // 空の場合はタグ + , (次のタグを入力しやすくするため)
                      setTags(`${tag},`);
                    } else {
                      // すでに入力がある場合
                      const trimmed = tags.trim();
                      // 最後に区切り文字があるか確認
                      if (trimmed.endsWith(",") || trimmed.endsWith("、")) {
                        // 区切り文字の後にスペースがあるか確認
                        setTags(`${trimmed} ${tag}`);
                      } else {
                        // 区切り文字がない場合は追加
                        setTags(`${trimmed}, ${tag}`);
                      }
                    }
                    setShowTagSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                >
                  {tag}
                </button>
              ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1">
          2つ以上の場合は、区切りを入れてください
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
