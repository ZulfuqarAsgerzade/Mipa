import { NextResponse, type NextRequest } from "next/server";

const locales = ["az", "en", "ru"];

function preferred(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  for (const part of header.split(",")) {
    const code = part.split(";")[0].trim().slice(0, 2).toLowerCase();
    if (locales.includes(code)) return code;
  }
  return "az";
}

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL(`/${preferred(request)}`, request.url));
}

export const config = { matcher: "/" };
