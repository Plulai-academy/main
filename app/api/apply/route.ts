// app/api/apply/route.ts
// Server-side API route — no CORS, no browser restrictions

import { NextRequest, NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyYitrrHcoTEITl2xJadJZ1OPGd8qymD0_WGt8NqJp-O2spWmu7XkWIW6vm7ydCdc0K/exec";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const params = new URLSearchParams({
      parentName: body.parentName || "",
      childName:  body.childName  || "",
      childAge:   body.childAge   || "",
      email:      body.email      || "",
      whatsapp:   body.whatsapp   || "",
      idea:       body.idea       || "",
      timestamp:  new Date().toISOString(),
    });

    // This runs on the SERVER — no CORS restrictions whatsoever
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
    const text = await response.text();

    return NextResponse.json({ success: true, raw: text });
  } catch (err) {
    console.error("Apply route error:", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}