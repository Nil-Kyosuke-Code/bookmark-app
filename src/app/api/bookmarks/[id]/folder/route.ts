import { auth, prisma } from "@/auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ログインしているか確認
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "未認証" }, { status: 401 });
    }

    const { folderId } = await req.json();
    const { id } = await params; // awaitで取り出す
    const bookmarkId = id;

    // ブックマークを更新
    const updated = await prisma.bookmark.update({
      where: { id: bookmarkId },
      data: {
        folders: {
          connect: { id: folderId }, // connectで紐付け
        },
      },
      include: {
        folders: true, // フォルダ情報も返す
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "フォルダへの追加に失敗しました" },
      { status: 500 }
    );
  }
}
