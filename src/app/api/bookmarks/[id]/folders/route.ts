// ブックマークのフォルダ管理API(ブックマークが所属するフォルダを更新)

import { auth, prisma } from "@/auth";
import { NextResponse } from "next/server";

// フォルダを更新（PATCH）
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const { folderIds } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // ブックマークを取得して権限確認
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    });

    if (!bookmark || bookmark.userId !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // フォルダとの関連を更新
    const updatedBookmark = await prisma.bookmark.update({
      where: { id },
      data: {
        folders: {
          set: folderIds.map((folderId: string) => ({ id: folderId })),
        },
      },
      include: {
        folders: true,
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
