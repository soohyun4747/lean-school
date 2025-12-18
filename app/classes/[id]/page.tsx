import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ICourse } from '@/app/(dashboard)/admin/courses/page';
import { generateSlotsFromWindows } from '@/lib/time';
import { applyToCourse } from '@/app/actions/student';
import { SlotSelector } from '@/components/features/slot-selector';
import { Button } from '@/components/ui/button';

const days = ['일', '월', '화', '수', '목', '금', '토'];

export default async function StudentCourseDetail({
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
		.select(
			'id, title, subject, grade_range, description, duration_minutes, capacity, image_url'
		)
		.eq('id', id)
		.single();

	if (!data) notFound();

	const course: ICourse = data;

	const { data: windows, error } = await supabase
		.from('course_time_windows')
		.select('id, day_of_week, start_time, end_time')
		.eq('course_id', course.id)
		.order('day_of_week', { ascending: true });

	if (error) {
		console.error({ error });
	}

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
		<div className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr] mx-auto max-w-6xl px-4 py-12 space-y-8'>
			<div className='space-y-4'>
				<div className='overflow-hidden rounded-lg border border-[var(--primary-border)] bg-[var(--primary-soft)]'>
					{course.image_url ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={course.image_url}
							alt={`${course.title} 이미지`}
							height={1000}
							width={530}
							className='h-auto w-full object-cover'
						/>
					) : (
						<div className='flex h-64 items-center justify-center text-sm font-semibold text-[var(--primary)]'>
							대표 이미지가 아직 등록되지 않았어요
						</div>
					)}
				</div>
			</div>
			<div className='flex flex-col gap-3'>
				<div className='space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm'>
					<div className='flex items-start justify-between gap-3'>
						<div>
							<h1 className='text-xl font-semibold text-slate-900'>
								{course.title}
							</h1>
							<p className='text-sm text-slate-600'>
								{course.subject} · {course.grade_range} ·{' '}
								{course.duration_minutes}분 · 정원{' '}
								{course.capacity}
							</p>
						</div>
					</div>
					{course.description && (
						<p className='text-sm text-slate-700'>
							{course.description}
						</p>
					)}
				</div>
				{/* <Card>
					<CardHeader>
						<CardTitle>가능 시간 범위</CardTitle>
					</CardHeader>
					<CardContent className='space-y-2 text-sm'>
						{(windows ?? []).length === 0 && (
							<p className='text-slate-600'>
								관리자가 아직 시간을 등록하지 않았습니다.
							</p>
						)}
						{windows?.map((w) => (
							<div
								key={w.id}
								className='flex items-center justify-between rounded-md border border-slate-200 px-4 py-2'>
								<span className='font-semibold text-slate-800'>
									{days[w.day_of_week]}
								</span>
								<span className='text-slate-700'>
									{w.start_time} - {w.end_time}
								</span>
							</div>
						))}
					</CardContent>
				</Card> */}
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
								* course_time_windows 범위 내 다가오는 2주
								동안의 슬롯이 생성됩니다.
							</p>
							<Button
								type='submit'
								className='w-full'>
								신청 제출
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
