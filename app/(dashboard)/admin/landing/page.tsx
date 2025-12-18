import Image from "next/image";
import { deleteLandingImage, uploadLandingImage } from "@/app/actions/landing";
import { fetchLandingImages } from "@/lib/landing";

export default async function LandingAdminPage() {
  const images = await fetchLandingImages();
  const current = images[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">랜딩 이미지 관리</h1>
        <p className="text-sm text-slate-600">
          랜딩페이지에 노출되는 사진을 업로드하거나 삭제할 수 있습니다. 가장 최근 이미지가 자동으로 사용됩니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3 rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">현재 노출 이미지</h2>
          {current ? (
            <div className="space-y-2">
              <div className="relative h-64 overflow-hidden rounded-xl border bg-slate-100 md:h-80">
                <Image
                  src={current.publicUrl}
                  alt="현재 랜딩 이미지"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                />
              </div>
              {current.createdAt && (
                <p className="text-xs text-slate-500">업로드: {new Date(current.createdAt).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">아직 업로드된 랜딩 이미지가 없습니다.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">새 이미지 업로드</h2>
          <p className="text-sm text-slate-600">1장의 이미지만 노출되며, 최신 업로드가 우선 적용됩니다.</p>
          <form action={uploadLandingImage} className="mt-4 space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">이미지 파일</label>
              <input
                type="file"
                name="image"
                accept="image/*"
                required
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
            >
              업로드
            </button>
            <p className="text-xs text-slate-500">권장: 가로형, 1600px 이상의 고해상도 이미지</p>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">업로드 내역</h2>
          <p className="text-xs text-slate-500">총 {images.length}개</p>
        </div>
        {images.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">업로드된 이미지가 없습니다.</p>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <article
                key={image.path}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm"
              >
                <div className="relative h-36 w-full bg-white">
                  <Image
                    src={image.publicUrl}
                    alt={image.name}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 300px, 50vw"
                  />
                </div>
                <div className="space-y-2 p-3">
                  <p className="text-sm font-semibold text-slate-900">{image.name}</p>
                  {image.createdAt && (
                    <p className="text-xs text-slate-500">업로드: {new Date(image.createdAt).toLocaleString()}</p>
                  )}
                  <form action={deleteLandingImage}>
                    <input type="hidden" name="path" value={image.path} />
                    <button
                      type="submit"
                      className="w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
