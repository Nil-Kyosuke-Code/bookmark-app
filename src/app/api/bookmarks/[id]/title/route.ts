/*
タイトル編集用API
ブックマークのタイトルを変更する
*/

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/auth";

// タイトルを更新(PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // paramsの取得
    const { id } = await params;

    // ログインしているか確認
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストから新しいタイトルを取得
    const { title } = await request.json();

    // ユーザーの取得
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // ブックマークを取得して、自分のものか確認
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

    // タイトルを更新
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json(updatedBookmark);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
