import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwq_0DRYayGk9dwfV0YZSo7k7itAPvS-5nKZEcak1x-itxE6XUIimSDUD-C7cj6kkhLUw/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as Record<string, string>;

    const formBody = Object.entries(body)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody,
    });

    return NextResponse.json({ result: "success" });
  } catch (err) {
    console.error("Order proxy error:", err);
    return NextResponse.json({ result: "error" }, { status: 500 });
  }
}