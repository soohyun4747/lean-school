import Image from "next/image";
import Link from "next/link";
import { fetchLatestLandingImage } from "@/lib/landing";

const fallbackImage =
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80";

export default async function HomePage() {
  const landingImage = await fetchLatestLandingImage();
  const imageUrl = landingImage?.publicUrl || fallbackImage;

  return (
    <div className="bg-gradient-to-b from-[#f5f7f5] via-white to-[#eef3ee]">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="relative h-[70vh] overflow-hidden rounded-3xl border border-[var(--primary-border)] bg-slate-900 shadow-xl md:h-[78vh]">
          <Image
            src={imageUrl}
            alt="린스쿨 랜딩 이미지"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />
          <div className="absolute inset-0 flex flex-col justify-end gap-4 p-8 text-white sm:p-12">
            <p className="inline-flex w-fit items-center rounded-full bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              린스쿨 · 한 장으로 보여주는 온라인 수업
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              학생과 강사를 잇는
              <br />
              단 하나의 사진
            </h1>
            <p className="max-w-2xl text-sm text-slate-100 sm:text-base">
              모든 안내를 단순하게. 수업 소개와 신청, 매칭까지 한 곳에서 이어지는 린스쿨을 만나보세요.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--primary-strong)]"
              >
                문의하기
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20"
              >
                로그인
              </Link>
            </div>
            {landingImage?.createdAt && (
              <p className="text-xs text-white/70">업로드: {new Date(landingImage.createdAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>

        <div className="mt-12">
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--primary-border)] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">contact</p>
              <h2 className="text-xl font-bold text-slate-900">팀과 바로 연결되어 상담을 진행하세요</h2>
              <p className="text-sm text-slate-600">
                문의 폼을 통해 수업 소개 자료와 상세 프로세스를 안내드립니다.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
            >
              Contact 페이지로 이동
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
