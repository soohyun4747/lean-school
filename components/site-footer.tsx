import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-slate-800">린스쿨</p>
          <p className="text-slate-500">학생과 강사를 연결하는 온라인 수업 매칭 플랫폼</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link href="/contact" className="text-[var(--primary)] hover:underline">
            문의하기
          </Link>
          <Link href="/auth/login" className="hover:text-[var(--primary)]">
            로그인
          </Link>
          <Link href="/classes" className="hover:text-[var(--primary)]">
            수업 보기
          </Link>
        </div>
      </div>
    </footer>
  );
}
