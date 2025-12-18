import { notFound, redirect } from 'next/navigation';
import { SlotSelector } from '@/components/features/slot-selector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { generateSlotsFromWindows } from '@/lib/time';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { applyToCourse } from '@/app/actions/student';
import { ICourse } from '@/app/(dashboard)/admin/courses/page';

export default async function StudentApplyPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { profile } = await requireSession();
	requireRole(profile.role, ['student']);
	
  const { id } = await params;

	const supabase = await getSupabaseServerClient();

	const { data } = await supabase
		.from('courses')
		.select('id, title, subject, grade_range, description, duration_minutes, image_url')
		.eq('id', id)
		.single();

	if (!data) notFound();

  const course: ICourse = data;

	const { data: windows } = await supabase
		.from('course_time_windows')
		.select('day_of_week, start_time, end_time')
		.eq('course_id', course.id);

	const slots = generateSlotsFromWindows(windows ?? [], {
		durationMinutes: course.duration_minutes,
	});
	const availableSlots = slots.map((slot) => ({
		start: slot.start.toISOString(),
		end: slot.end.toISOString(),
	}));

	async function action(formData: FormData) {
		'use server';
		const selected = String(formData.get('slots') ?? '');
		await applyToCourse(course.id, selected);
		redirect('/student/applications');
	}

	return (
		<div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
			<div className='space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
				<div className='overflow-hidden rounded-lg border border-[var(--primary-border)] bg-[var(--primary-soft)]'>
					{course.image_url ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={course.image_url}
							alt={`${course.title} 이미지`}
							className='h-64 w-full object-cover'
						/>
					) : (
						<div className='flex h-64 items-center justify-center text-sm font-semibold text-[var(--primary)]'>
							수업 이미지가 등록되면 이곳에 표시됩니다
						</div>
					)}
				</div>
				<div className='space-y-2'>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<h1 className='text-xl font-semibold text-slate-900'>
								{course.title}
							</h1>
							<p className='text-sm text-slate-600'>
								{course.subject} · {course.grade_range} · {course.duration_minutes}분
							</p>
						</div>
						<span className='rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-semibold text-[var(--primary)]'>
							정원 {course.capacity}
						</span>
					</div>
					{course.description ? (
						<p className='text-sm text-slate-700'>
							{course.description}
						</p>
					) : (
						<p className='text-sm text-slate-500'>
							수업 소개가 준비되는 대로 업데이트될 예정입니다.
						</p>
					)}
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>가능한 시간 선택 (1시간 단위)</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<form
						action={action}
						className='space-y-3'>
						<SlotSelector availableSlots={availableSlots} />
						<p className='text-xs text-slate-600'>
							* course_time_windows 범위 내 다가오는 2주 동안의 슬롯이
							생성됩니다.
						</p>
						<Button type='submit' className='w-full'>
							신청 제출
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
