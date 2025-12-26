'use server';

import { revalidatePath } from "next/cache";
import { requireRole, requireSession } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LandingVariant = "desktop" | "mobile";

function parseVariant(formData: FormData): LandingVariant {
  const variant = formData.get("variant");
  return variant === "mobile" ? "mobile" : "desktop";
}

export async function uploadLandingImage(formData: FormData) {
  const { profile } = await requireSession();
  requireRole(profile.role, ["admin"]);
  const supabase = await getSupabaseServerClient();

  const variant = parseVariant(formData);

  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("업로드할 이미지를 선택해주세요.");
  }

  if (image.type && !image.type.startsWith("image/")) {
    throw new Error("이미지 파일만 업로드할 수 있습니다.");
  }

  const extension = image.name.split(".").pop() || "png";
  const fileName = `${crypto.randomUUID?.() ?? Date.now().toString()}.${extension}`;
  const folderPath = `landing/${variant}`;
  const filePath = `${folderPath}/${fileName}`;

  const { error } = await supabase.storage.from("landing-images").upload(filePath, image, {
    cacheControl: "3600",
    upsert: false,
    contentType: image.type || undefined,
  });

  if (error) {
    console.error("랜딩 이미지 업로드 실패:", error);
    throw new Error("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.");
  }

  // 새 이미지 업로드 후 동일한 유형의 이전 이미지를 모두 삭제합니다.
  const { data: existingFiles, error: listError } = await supabase.storage.from("landing-images").list(folderPath, {
    limit: 50,
  });

  if (!listError) {
    const pathsToDelete = existingFiles
      ?.map((file) => `${folderPath}/${file.name}`)
      .filter((path) => path !== filePath);

    if (pathsToDelete && pathsToDelete.length > 0) {
      const { error: deleteError } = await supabase.storage.from("landing-images").remove(pathsToDelete);
      if (deleteError) {
        console.error("이전 랜딩 이미지 정리 실패:", deleteError);
      }
    }
  }

  // 데스크톱 이미지가 업데이트되는 경우, 루트 폴더의 이전 이미지도 정리합니다.
  if (variant === "desktop") {
    const { data: rootFiles, error: rootListError } = await supabase.storage.from("landing-images").list("landing", {
      limit: 50,
    });

    if (!rootListError) {
      const legacyPaths = rootFiles
        ?.filter((file) => !file.name.includes("/"))
        .map((file) => `landing/${file.name}`)
        .filter((path) => path !== filePath);

      if (legacyPaths && legacyPaths.length > 0) {
        const { error: legacyDeleteError } = await supabase.storage.from("landing-images").remove(legacyPaths);
        if (legacyDeleteError) {
          console.error("레거시 랜딩 이미지 정리 실패:", legacyDeleteError);
        }
      }
    }
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
