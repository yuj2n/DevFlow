import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url)
    return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });

  try {
    const response = await axios.get(url);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("Swagger fetch error:", error);
    return NextResponse.json(
      { error: "데이터를 가져오지 못했습니다." },
      { status: 500 },
    );
  }
}
