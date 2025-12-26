import Image from "next/image";
import { uploadLandingImage } from "@/app/actions/landing";
import { fetchLatestLandingImage } from "@/lib/landing";

export default async function LandingAdminPage() {
  const [desktopImage, mobileImage] = await Promise.all([
    fetchLatestLandingImage("desktop"),
    fetchLatestLandingImage("mobile"),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-900">랜딩 이미지 관리</h1>
        <p className="text-sm text-slate-600">
          랜딩페이지에 노출되는 사진을 업로드할 수 있습니다. 새로운 이미지를 업로드하면 이전 이미지는 자동으로 삭제됩니다.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">현재 노출 이미지 (데스크톱)</h2>
          {desktopImage ? (
            <div className="space-y-2">
              <div className="relative h-64 overflow-hidden rounded-xl border bg-slate-100 md:h-80">
                <Image
                  src={desktopImage.publicUrl}
                  alt="현재 랜딩 이미지 (데스크톱)"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                />
              </div>
              {desktopImage.createdAt && (
                <p className="text-xs text-slate-500">업로드: {new Date(desktopImage.createdAt).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">아직 업로드된 데스크톱용 랜딩 이미지가 없습니다.</p>
          )}
        </div>

        <div className="space-y-3 rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">현재 노출 이미지 (모바일)</h2>
          {mobileImage ? (
            <div className="space-y-2">
              <div className="relative h-64 overflow-hidden rounded-xl border bg-slate-100 md:h-80">
                <Image
                  src={mobileImage.publicUrl}
                  alt="현재 랜딩 이미지 (모바일)"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 720px, 100vw"
                  priority
                />
              </div>
              {mobileImage.createdAt && (
                <p className="text-xs text-slate-500">업로드: {new Date(mobileImage.createdAt).toLocaleString()}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-600">아직 업로드된 모바일용 랜딩 이미지가 없습니다.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">새 이미지 업로드 (데스크톱)</h2>
          <p className="text-sm text-slate-600">1장의 이미지만 노출되며, 최신 업로드가 우선 적용됩니다.</p>
          <form action={uploadLandingImage} className="mt-4 space-y-3">
            <input type="hidden" name="variant" value="desktop" />
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

        <div className="rounded-2xl border border-[var(--primary-border)] bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">새 이미지 업로드 (모바일)</h2>
          <p className="text-sm text-slate-600">모바일 방문 시 노출되는 전용 이미지를 업로드하세요.</p>
          <form action={uploadLandingImage} className="mt-4 space-y-3">
            <input type="hidden" name="variant" value="mobile" />
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
            <p className="text-xs text-slate-500">권장: 세로 우선 비율의 모바일 최적화 이미지</p>
          </form>
        </div>
      </div>
    </div>
  );
}
