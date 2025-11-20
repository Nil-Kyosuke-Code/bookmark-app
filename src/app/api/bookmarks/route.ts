/*
ブックマークの追加・取得・削除を処理する(ブックマークAPI)

GET: ログイン中のユーザーのブックマーク一覧を取得
POST: 新しいブックマークを追加
*/
import { NextResponse } from "next/server";
import { auth, prisma } from "@/auth";

// ブックマークを取得する(GET)
export async function GET() {
  try {
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

    // ユーザーのブックマークを全て取得(新しい順)
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        folders: true,
      },
    });
    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}

// ブックマークを追加(POST)
export async function POST(request: Request) {
  try {
    // ログインしているか確認
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
    }

    // リクエストからURLとメタ情報を取得
    const { url, tags, title, description, imageUrl } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
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

    // ブックマークを作成
    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        tags: tags || [], // タグがなければ空配列
        title,
        description,
        imageUrl,
        userId: user.id,
      },
    });
    return NextResponse.json(bookmark);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "エラーが発生しました" },
      { status: 500 }
    );
  }
}
