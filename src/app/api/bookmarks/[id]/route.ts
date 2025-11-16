/*
ブックマーク削除API

ログインチェック：ログインしてるか確認
権限チェック：削除しようとしてるブックマークが自分のものか確認
削除実行：OKなら削除
*/

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/auth";

// ブックマークを削除（DELETE）
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // paramsがPromiseだと明示
) {
  try {
    // paramsを取得
    const { id } = await params;

    // ログインしているか確認
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // ユーザーを取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // IDからブックマークを取得して、自分のものか確認
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark) {
      return NextResponse.json(
        { error: "ブックマークが見つかりません" },
        { status: 404 }
      );
    }

    if (bookmark.userId !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // ブックマークを削除
    await prisma.bookmark.delete({
      where: { id },
    });

    return NextResponse.json({ message: "削除しました" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
