// 個別フォルダAPI(フォルダの編集と削除)

import { auth, prisma } from "@/auth";
import { NextResponse } from "next/server";

// フォルダ名を更新(PATCH)
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

    const { name } = await request.json();

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 403 }
      );
    }

    //　フォルダを取得して権限確認
    const folder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // フォルダ名を更新
    const updatedFolder = await prisma.folder.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updatedFolder);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}

// フォルダを削除(DELETE)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "ユーザーが見つかりません" },
        { status: 404 }
      );
    }

    // フォルダを取得して権限確認
    const folder = await prisma.folder.findUnique({
      where: { id },
    });

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json({ error: "権限がありません" }, { status: 403 });
    }

    // フォルダを削除(ブックマークとの関連は自動削除)
    await prisma.folder.delete({
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
