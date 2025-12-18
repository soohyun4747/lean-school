import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { getSessionAndProfile } from "@/lib/auth";

const roleFeatures = [
  {
    title: "관리자",
    description: "수업 개설, 시간 범위 등록, 학생·강사 매칭을 한 번에 관리합니다.",
    items: ["수업 등록·관리", "학생/강사 현황 파악", "자동 매칭 실행"],
  },
  {
    title: "학생",
    description: "관심 수업을 확인하고 가능한 시간을 선택해 손쉽게 신청하세요.",
    items: ["수업 소개 확인", "가능 시간 선택 신청", "신청 현황·시간표"],
  },
  {
    title: "강사",
    description: "담당 과목과 가능한 시간을 입력하고 배정 결과를 확인합니다.",
    items: ["가능 과목 등록", "가능 시간 슬롯 입력", "배정·시간표 확인"],
  },
];

export default async function Home() {
  let profile = null;

  try {
    const sessionData = await getSessionAndProfile();
    profile = sessionData.profile;
  } catch (error) {
    console.error("세션 정보를 불러오는 중 오류가 발생했습니다:", error);
  }

  const cta = profile
    ? { href: "/dashboard", label: "대시보드로 이동" }
    : { href: "/auth/signup", label: "지금 시작하기" };

  const primaryButtonClasses =
    "inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)]";
  const secondaryButtonClasses =
    "inline-flex items-center gap-2 rounded-md bg-slate-100 px-5 py-3 text-base font-semibold text-slate-900 shadow-sm transition hover:bg-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f5f7f5] via-white to-[#eef3ee]">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full bg-[var(--primary-soft)] px-4 py-1 text-xs font-semibold text-[var(--primary)]">
              린스쿨 · 온라인 학습 매칭 플랫폼
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
              학생과 강사를 연결하는
              <br /> 간결한 수업 운영 도구
            </h1>
            <p className="text-lg text-slate-700">
              수업 소개부터 신청, 매칭, 일정 확정까지 한 화면에서 관리하세요. 필요한 정보만 깔끔하게
              보여주는 경량형 스쿨 매니저입니다.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href={cta.href} className={primaryButtonClasses}>
                {cta.label}
                <span aria-hidden>→</span>
              </Link>
              {!profile && (
                <Link href="/auth/login" className={secondaryButtonClasses}>
                  이미 계정이 있나요?
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-slate-700">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                ✔️ 1시간 단위 시간 관리
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                🔒 Supabase 인증/보안 적용
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                ⚡️ 매칭 결과 한눈에 확인
              </span>
            </div>
          </div>

          <Card className="border-[var(--primary-border)] shadow-lg">
            <CardContent className="space-y-4 p-6">
              <div className="rounded-lg bg-[var(--primary-soft)] px-4 py-3 text-sm text-[var(--primary-strong)]">
                학생, 강사, 관리자 역할별로 필요한 정보만 간결하게 구성했습니다.
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                  <span>주요 흐름</span>
                  <span className="text-[var(--primary)]">관리 · 신청 · 매칭</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-700">
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">관리자</p>
                    <p>수업/시간 등록, 자동 매칭</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">학생</p>
                    <p>수업 확인, 시간 선택 신청</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2">
                    <p className="font-semibold text-slate-900">강사</p>
                    <p>가능 과목·시간 입력</p>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">시간표 자동화</p>
                <p className="mt-1">
                  학생/강사 가능한 시간 슬롯을 모아 자동 매칭하고, 결과를 한 번에 확인·공유합니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 space-y-8">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--primary)]">역할별 기능</p>
            <h2 className="text-2xl font-bold text-slate-900">모두를 위한 간결한 워크플로</h2>
            <p className="text-sm text-slate-600">관리자는 설정하고, 학생과 강사는 신청과 참여에 집중합니다.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {roleFeatures.map((feature) => (
              <Card key={feature.title} className="border-slate-200">
                <CardContent className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <span className="text-sm text-[var(--primary)]">핵심</span>
                  </div>
                  <p className="text-sm text-slate-700">{feature.description}</p>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {feature.items.map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <span className="text-[var(--primary)]">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
