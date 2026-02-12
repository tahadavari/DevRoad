import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";

const MAX_SIZE = 25 * 1024 * 1024; // 25MB

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: "احراز هویت لازم است" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string) || "image"; // image | voice | video

    if (!file || !file.size) {
      return NextResponse.json(
        { success: false, error: "فایلی ارسال نشده است" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "حداکثر حجم فایل ۲۵ مگابایت است" },
        { status: 400 }
      );
    }

    const allowedTypes =
      type === "voice"
        ? ["audio/", "video/"] // webm etc
        : type === "video"
          ? ["video/"]
          : ["image/"];
    if (!allowedTypes.some((t) => file.type.startsWith(t))) {
      return NextResponse.json(
        { success: false, error: "نوع فایل مجاز نیست" },
        { status: 400 }
      );
    }

    const mapType = type === "voice" ? "voice" : type === "video" ? "video" : "image";
    const { url } = await saveUpload(file, mapType);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "خطا در آپلود" },
      { status: 500 }
    );
  }
}
