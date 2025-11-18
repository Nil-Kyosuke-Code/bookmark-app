// ブックマーク一覧
// 保存したブックマークを表示するコンポーネント
"use client";

import { useEffect, useState } from "react";
import { ArrowUpDown, MoreVertical, Star } from "lucide-react";
// ブックマークの型定義
type Bookmark = {
  id: string;
  url: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  tags: string[];
  isFavorite: boolean;
  folders?: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
};

type Props = {
  selectedFolderId: string | null;
};

export default function BookmarkList({ selectedFolderId }: Props) {
  // ブックマーク一覧を保存する変数
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  // 読み込み中かどうか
  const [isLoading, setIsLoading] = useState(true);

  // 選択中のタグ(フィルター用)
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // 検索キーワード
  const [searchQuery, setSearchQuery] = useState("");

  // 開いてるメニューのブックマークID
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // 編集中のブックマーク
  const [editingBookmark, setEditingBookmark] = useState<{
    id: string;
    title: string;
  } | null>(null);

  // 編集中のタイトル
  const [editTitle, setEditTitle] = useState("");

  // 編集中のタグ
  const [editingTags, setEditingTags] = useState<{
    id: string;
    tags: string[];
  } | null>(null);

  // 編集中のタグ入力値
  const [editTagsInput, setEditTagsInput] = useState("");

  // 並べ替えの種類
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title" | "favorite"
  >("newest");

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
    let filtered = bookmarks;

    // フォルダでフィルター
    if (selectedFolderId) {
      filtered = filtered.filter((bookmark) =>
        bookmark.folders?.some((folder: any) => folder.id === selectedFolderId)
      );
    }

    // 検索キーワードでフィルター
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((bookmark) => {
        const title = (bookmark.title || "").toLowerCase();
        const url = bookmark.url.toLowerCase();
        const description = (bookmark.description || "").toLowerCase();
        const tags = bookmark.tags.join(" ").toLowerCase();

        return (
          title.includes(query) ||
          url.includes(query) ||
          description.includes(query) ||
          tags.includes(query)
        );
      });
    }

    // タグが選択されてなければ、検索結果をそのまま返す
    if (!selectedTag) return filtered;

    // お気に入りフィルター
    if (selectedTag === "favorites") {
      return filtered.filter((bookmark) => bookmark.isFavorite);
    }

    // タグフィルター(選択したタグを持つもののみ表示)
    return filtered.filter((bookmark) => bookmark.tags.includes(selectedTag));
  };

  // 並べ替えを適用する関数
  const getSortedBookmarks = () => {
    const filtered = getFilteredBookmarks();

    switch (sortBy) {
      case "newest":
        // 新しい順(作成日時の降順)
        return [...filtered].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      case "oldest":
        // 古い順(作成日時の昇順)
        return [...filtered].sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

      case "title":
        // タイトル順
        return [...filtered].sort((a, b) => {
          const titleA = (a.title || a.url).toLowerCase();
          const titleB = (b.title || b.url).toLowerCase();
          return titleA.localeCompare(titleB);
        });

      case "favorite":
        // お気に入りを先に表示
        return [...filtered].sort((a, b) => {
          if (a.isFavorite === b.isFavorite) return 0;
          return a.isFavorite ? -1 : 1;
        });

      default:
        return filtered;
    }
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

  // タグ編集モーダルを開く
  const openEditTagsModal = (bookmark: Bookmark) => {
    setEditingTags({ id: bookmark.id, tags: bookmark.tags });
    setEditTagsInput(""); // 空文字で開く
    setOpenMenuId(null);
  };

  // タグを保存
  const handleSaveTags = async () => {
    if (!editingTags) return;

    try {
      // 入力値をタグ配列に変換
      const tagArray = editTagsInput
        .split(/[,、]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // 空の場合は元のタグを維持(変更なし)
      const tagsToSave = tagArray.length > 0 ? tagArray : editingTags.tags;

      const response = await fetch(`/api/bookmarks/${editingTags.id}/tags`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags: tagsToSave }),
      });

      if (response.ok) {
        // 成功したら一覧を再取得
        fetchBookmarks();
        setEditingTags(null);
        setEditTagsInput("");
      } else {
        alert("タグの変更に失敗しました");
      }
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  // タグ編集をキャンセル
  const cancelEditTags = () => {
    setEditingTags(null);
    setEditTagsInput("");
  };

  // 読み込み中の表示
  if (isLoading) {
    return <div className="text-center py-8">読み込み中...</div>;
  }

  // ブックマークが0件の場合
  if (getFilteredBookmarks().length === 0 && !selectedTag && !searchQuery) {
    return (
      <div className="text-center py-8 text-gray-500">
        ブックマークがまだありません。
        <br />
        上のフォームからURLを追加してみましょう!
      </div>
    );
  }

  // ブックマーク一覧を表示
  return (
    <div className="space-y-4">
      {/* 検索ボックス */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="タイトル、URL、説明、タグで検索..."
          className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-1">
            検索中: "{searchQuery}" - {getFilteredBookmarks().length}件
          </p>
        )}
      </div>

      {/* タグフィルター */}
      {getAllTags().length > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">
              タグで絞り込み
            </h3>

            {/* 右側のボタングループ */}
            <div className="flex items-center gap-2">
              {/* お気に入りフィルター */}
              <button
                onClick={() =>
                  setSelectedTag(
                    selectedTag === "favorites" ? null : "favorites"
                  )
                }
                className={`flex items-center gap-1 px-3 py-1 text-sm rounded-full ${
                  selectedTag === "favorites"
                    ? "bg-yellow-400 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Star className="w-4 h-4" />
                お気に入り
              </button>

              {/* 並べ替えボタン */}
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenMenuId(openMenuId === "sort" ? null : "sort")
                  }
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300"
                >
                  <ArrowUpDown className="w-4 h-4" />
                  並べ替え
                </button>

                {/* 並べ替えメニュー */}
                {openMenuId === "sort" && (
                  <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setSortBy("newest");
                        setOpenMenuId(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === "newest"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      新しい順
                    </button>

                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setOpenMenuId(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === "oldest"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      古い順
                    </button>

                    <button
                      onClick={() => {
                        setSortBy("oldest");
                        setOpenMenuId(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === "title"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      タイトル順
                    </button>

                    <button
                      onClick={() => {
                        setSortBy("favorite");
                        setOpenMenuId(null);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === "favorite"
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700"
                      }`}
                    >
                      お気に入り順
                    </button>
                  </div>
                )}
              </div>
            </div>
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

      {getSortedBookmarks().map((bookmark) => (
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
                        onClick={() => openEditTagsModal(bookmark)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        タグを編集
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
      {/* タグ編集モーダル */}
      {editingTags && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">タグを編集</h3>

            <div className="relative">
              <input
                type="text"
                value={editTagsInput}
                onChange={(e) => setEditTagsInput(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                autoFocus
              />

              {/* タグ候補 */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">既存タグから選択</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {getAllTags()
                    .filter((tag) => {
                      // 現在入力中のタグを配列に変換
                      const currentTags = editTagsInput
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
                          // タグを追加
                          if (!editTagsInput) {
                            setEditTagsInput(`${tag},`);
                          } else {
                            const trimmed = editTagsInput.trim();
                            if (
                              trimmed.endsWith(",") ||
                              trimmed.endsWith("、")
                            ) {
                              setEditTagsInput(`${trimmed} ${tag},`);
                            } else {
                              setEditTagsInput(`${trimmed}, ${tag},`);
                            }
                          }
                        }}
                        className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200"
                      >
                        {tag}
                      </button>
                    ))}
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                カンマ（,）または読点（、）で区切ってください
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={cancelEditTags}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                キャンセル
              </button>

              <button
                onClick={handleSaveTags}
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
