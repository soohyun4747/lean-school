import Link from "next/link";
import { getSessionAndProfile } from "@/lib/auth";

export async function SiteHeader() {
  let isLoggedIn = false;
  const hasSupabaseEnv = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (hasSupabaseEnv) {
    try {
      const { profile } = await getSessionAndProfile();
      isLoggedIn = Boolean(profile);
    } catch (error) {
      console.error("헤더 세션 확인 실패:", error);
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-[var(--primary)]">
          린스쿨
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-slate-700">
          <Link href="/" className="hover:text-[var(--primary)]">
            홈
          </Link>
          <Link href="/classes" className="hover:text-[var(--primary)]">
            수업
          </Link>
          <Link href={isLoggedIn ? "/dashboard" : "/auth/login"} className="hover:text-[var(--primary)]">
            {isLoggedIn ? "대시보드" : "로그인"}
          </Link>
        </nav>
      </div>
    </header>
  );
}
