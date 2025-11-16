/*
メタ情報取得API
URLからタイトル・説明・画像を取得する
*/

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(request: Request) {
  try {
    // リクエストからURLを取得
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
    }

    // URLにアクセスしてHTMLを取得
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BookmarkBot/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "URLの取得に失敗しました" },
        { status: 400 }
      );
    }

    // HTMLを文字列として取得
    const html = await response.text();

    // cheerioでHTMLを解析
    const $ = cheerio.load(html);

    // メタ情報を取得
    // OGP（Open Graph Protocol）タグから取得
    const title =
      $('meta[property="og:title"]').attr("content") || // OGタイトル
      $("title").text() || // 通常のタイトルタグ
      url; // なければURLをそのまま

    const description =
      $('meta[property="og:description"]').attr("content") || // OG説明
      $('meta[name="description"]').attr("content") || // 通常の説明
      ""; // なければ空

    const imageUrl =
      $('meta[property="og:image"]').attr("content") || // OG画像
      ""; // なければ空

    // 取得した情報を返す
    return NextResponse.json({
      title,
      description,
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "メタ情報の取得に失敗しました" },
      { status: 500 }
    );
  }
}
