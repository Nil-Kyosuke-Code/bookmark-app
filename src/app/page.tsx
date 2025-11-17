/*
ホームページ
ログイン済みならダッシュボードへ、未ログインならログインページへリダイレクト
*/

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  // ログインしているか確認
  const session = await auth();

  // ログイン済みならダッシュボードへ
  if (session?.user) {
    redirect("/dashboard");
  }

  // 未ログインならログインページへ
  redirect("/login");
}
