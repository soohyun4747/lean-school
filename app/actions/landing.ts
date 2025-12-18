'use server';

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function uploadLandingImage(formData: FormData) {
  const { profile } = await requireSession();
  requireRole(profile.role, ["admin"]);
  const supabase = await getSupabaseServerClient();

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("업로드할 이미지를 선택해주세요.");
  }

  if (image.type && !image.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const extension = image.name.split(".").pop() || "png";
  const fileName = `${crypto.randomUUID?.() ?? Date.now().toString()}.${extension}`;
  const filePath = `landing/${fileName}`;

  const { error } = await supabase.storage.from("landing-images").upload(filePath, image, {
    cacheControl: "3600",
    upsert: false,
    contentType: image.type || undefined,
  });

  if (error) {
    console.error("랜딩 이미지 업로드 실패:", error);
    throw new Error("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
}

export async function deleteLandingImage(path: string) {
  const { profile } = await requireSession();
  requireRole(profile.role, ["admin"]);
  const supabase = await getSupabaseServerClient();

  if (!path.startsWith("landing/")) {
    throw new Error("잘못된 파일 경로입니다.");
  }

  const { error } = await supabase.storage.from("landing-images").remove([path]);

  if (error) {
    console.error("랜딩 이미지 삭제 실패:", error);
    throw new Error("이미지를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
  }

  revalidatePath("/");
  revalidatePath("/admin/landing");
}
