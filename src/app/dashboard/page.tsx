/*
ホーム画面（ダッシュボード）

ログイン後に表示されるメイン画面
ログインしているか確認する
ログインしてなければログインページに移動
ユーザー名を表示
ログアウトボタンを表示
*/

import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import AddBookmarkForm from "@/components/AddBookmarkForm";
import FolderSidebar from "@/components/FolderSidebar";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  // ログインしてるか確認する
  const session = await auth();

  // 未ログインならログインページに移動
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow">
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
