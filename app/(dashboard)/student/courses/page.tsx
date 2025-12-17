import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSession, requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function StudentCoursesPage() {
  const { profile } = await requireSession();
  requireRole(profile.role, ["student"]);
  const supabase = getSupabaseServerClient();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, subject, grade_range, capacity")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>수업 목록</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {(courses ?? []).length === 0 && <p className="text-sm text-slate-600">수업이 없습니다.</p>}
          {courses?.map((course) => (
            <div key={course.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="text-base font-semibold text-slate-900">{course.title}</h3>
              <p className="text-sm text-slate-600">
                {course.subject} · {course.grade_range} · 정원 {course.capacity}
              </p>
              <div className="mt-3 flex gap-2 text-sm">
                <Link
                  href={`/student/courses/${course.id}`}
                  className="rounded-md border border-slate-200 px-3 py-2 hover:bg-slate-50"
                >
                  상세
                </Link>
                <Link
                  href={`/student/courses/${course.id}/apply`}
                  className="rounded-md border border-blue-200 px-3 py-2 text-blue-700 hover:bg-blue-50"
                >
                  신청
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
