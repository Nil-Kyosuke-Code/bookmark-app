/*
お気に入り切り替えAPI
ブックマークのお気に入り状態をON/OFFにする
*/

import { auth, prisma } from "@/auth";
import { NextResponse } from "next/server";

// お気に入り状態を切り替え(PATCH)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
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

    // お気に入り状態を反転
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        isFavorite: !bookmark.isFavorite,
      },
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
