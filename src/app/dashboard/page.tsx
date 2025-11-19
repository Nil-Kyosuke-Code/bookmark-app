// ホーム画面（ダッシュボード）

import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import FolderSidebar from "@/components/Sidebar";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // ログインしてるか確認する
  const session = await auth();

  // 未ログインならログインページに移動
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* ヘッダー */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Bookmark App</h1>

          {/* ユーザー情報とログアウトボタン */}
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{session.user.name}</span>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      {/* メインコンテンツ */}
      <DashboardClient />
    </div>
  );
}
