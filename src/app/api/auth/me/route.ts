import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, data: null });
    }
    return NextResponse.json({ success: true, data: user });
  } catch {
    return NextResponse.json({ success: false, data: null });
  }
}
