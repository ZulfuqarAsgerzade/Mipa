import { NextResponse } from "next/server";

const MAX_FILE = 20 * 1024 * 1024;

export async function POST(request: Request) {
  const fd = await request.formData();
  const get = (k: string) => String(fd.get(k) ?? "").trim();

  const quote = {
    name: get("name"),
    company: get("company"),
    phone: get("phone"),
    email: get("email"),
    type: get("type"),
    volume: get("volume"),
    message: get("message"),
  };

  if (!quote.name || !quote.phone || !quote.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quote.email)) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }
  const file = fd.get("file");
  if (file instanceof File && file.size > MAX_FILE) {
    return NextResponse.json({ ok: false, error: "file_too_large" }, { status: 413 });
  }

  // TODO: deliver to the sales inbox (e.g. Resend / SMTP / Firestore) once credentials are available.
  console.info("[quote]", quote, file instanceof File && file.size ? `${file.name} (${file.size} B)` : "no file");

  return NextResponse.json({ ok: true });
}
