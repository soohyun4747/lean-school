'use server';

import { revalidatePath } from "next/cache";
import { requireSession, requireRole } from "@/lib/auth";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { runMatching } from "@/lib/matching";

export async function applyToCourse(courseId: string, windowIds: string[]) {
	const { session, profile } = await requireSession();
	requireRole(profile.role, ['student']);
	const supabase = await getSupabaseServerClient();
	const windowSet = Array.from(new Set(windowIds)).filter(Boolean);
	if (windowSet.length === 0) {
		throw new Error('최소 1개 이상의 시간을 선택해주세요.');
	}

	const { data: windows } = await supabase
		.from('course_time_windows')
		.select('id')
		.eq('course_id', courseId)
		.in('id', windowSet);

	if (!windows || windows.length === 0) {
		throw new Error('선택한 시간이 유효하지 않습니다.');
	}
	if (windows.length !== windowSet.length) {
		throw new Error('존재하지 않는 시간이 포함되어 있습니다.');
	}

	const { data: application, error } = await supabase
		.from('applications')
		.insert({ course_id: courseId, student_id: session!.user.id })
		.select('id')
		.single();

	if (error) {
		console.error(error);
	}

	if (application?.id) {
		const choiceRows = windowSet.map((wid) => ({
			application_id: application.id,
			window_id: wid,
		}));
		const { error: choiceError } = await supabase
			.from('application_time_choices')
			.insert(choiceRows);
		if (choiceError) {
			console.error('신청 시간 저장 실패', choiceError);
			throw new Error('선택한 시간 저장에 실패했습니다. 다시 시도해주세요.');
		}
	}

  try {
    const from = new Date();
    const to = new Date();
    to.setDate(from.getDate() + 14);

    await runMatching({ courseId, from: from.toISOString(), to: to.toISOString(), requestedBy: session!.user.id });
  } catch (error) {
    console.error("자동 매칭 실행 실패", error);
  }

  revalidatePath(`/student/courses/${courseId}`);
  revalidatePath("/student/applications");
  revalidatePath(`/admin/courses/${courseId}`);
  revalidatePath("/admin/courses");
  return application?.id;
}

export async function cancelApplication(applicationId: string) {
	const { profile } = await requireSession();
	requireRole(profile.role, ['student']);
	const supabase = await getSupabaseServerClient();

	await supabase
		.from('applications')
		.update({ status: 'cancelled' })
		.eq('id', applicationId)
		.eq('student_id', profile.id);

	revalidatePath('/student/applications');
}
