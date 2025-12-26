import Image from "next/image";
import Link from "next/link";
import { fetchLatestLandingImage } from "@/lib/landing";

export default async function HomePage() {
  const [desktopImage, mobileImage] = await Promise.all([
    fetchLatestLandingImage("desktop"),
    fetchLatestLandingImage("mobile"),
  ]);

  const desktopSrc = desktopImage?.publicUrl ?? mobileImage?.publicUrl;
  const mobileSrc = mobileImage?.publicUrl ?? desktopImage?.publicUrl;

  return (
    <div>
      {mobileSrc && (
        <Image
          src={mobileSrc}
          alt="린스쿨 랜딩 이미지 (모바일)"
          width={1080}
          height={1920}
          sizes="100vw"
          className="h-auto w-full md:hidden"
          priority
        />
      )}

      {desktopSrc && (
        <Image
          src={desktopSrc}
          alt="린스쿨 랜딩 이미지"
          width={1920}
          height={1080}
          sizes="100vw"
          className="hidden h-auto w-full md:block"
          priority
        />
      )}

      {!desktopSrc && !mobileSrc && (
        <div className="flex h-64 items-center justify-center bg-slate-100 text-sm text-slate-600 md:h-96">
          노출할 랜딩 이미지를 업로드해주세요.
        </div>
      )}

      <div className="mt-12 py-12 md:px-36">
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--primary-border)] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">contact</p>
            <h2 className="text-xl font-bold text-slate-900">궁금한게 있으신가요?</h2>
            <p className="text-sm text-slate-600">문의 폼을 통해 궁금한 점을 물어보세요</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
          >
            Contact 페이지로 이동
          </Link>
        </div>
      </div>
    </div>
  );
}
