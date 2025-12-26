import { getSupabaseServerClient } from "@/lib/supabase/server";

export type LandingImage = {
  name: string;
  path: string;
  publicUrl: string;
  createdAt?: string;
  variant: "desktop" | "mobile";
};

type LandingVariant = "desktop" | "mobile";

async function fetchLandingVariantImages(variant: LandingVariant): Promise<LandingImage[]> {
  const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasSupabaseEnv) {
    return [];
  }

  try {
    const supabase = await getSupabaseServerClient();
    const folderPath = `landing/${variant}`;
    const { data: variantFiles, error: variantError } = await supabase.storage.from("landing-images").list(folderPath, {
      limit: 50,
    });

    if (variantError) {
      console.error("랜딩 이미지 목록 조회 실패:", variantError);
      return [];
    }

    const variantImages =
      variantFiles?.map((file) => {
        const path = `${folderPath}/${file.name}`;
        const { data: urlData } = supabase.storage.from("landing-images").getPublicUrl(path);
        return {
          name: file.name,
          path,
          publicUrl: urlData.publicUrl,
          createdAt: file.created_at,
          variant,
        } satisfies LandingImage;
      }) ?? [];

    // 이전 버전과의 호환성을 위해 데스크톱 이미지에 대해 루트 폴더의 파일도 함께 조회합니다.
    const legacyDesktopImages: LandingImage[] = [];
    if (variant === "desktop") {
      const { data: rootFiles, error: rootError } = await supabase.storage.from("landing-images").list("landing", {
        limit: 50,
      });

      if (!rootError) {
        rootFiles
          ?.filter((file) => !file.name.includes("/"))
          .forEach((file) => {
            const path = `landing/${file.name}`;
            const { data: urlData } = supabase.storage.from("landing-images").getPublicUrl(path);
            legacyDesktopImages.push({
              name: file.name,
              path,
              publicUrl: urlData.publicUrl,
              createdAt: file.created_at,
              variant: "desktop",
            });
          });
      }
    }

    return [...variantImages, ...legacyDesktopImages].sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  } catch (error) {
    console.error("랜딩 이미지 정보를 불러오지 못했습니다:", error);
    return [];
  }

}

export async function fetchLatestLandingImage(variant: LandingVariant = "desktop"): Promise<LandingImage | null> {
  const images = await fetchLandingVariantImages(variant);
  return images[0] ?? null;
}
