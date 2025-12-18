import { notFound, redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { ICourse } from '@/app/(dashboard)/admin/courses/page';
import {
	buildSlotsFromDayTimeRanges,
	generateSlotsFromWindows,
} from '@/lib/time';
import { applyToCourse } from '@/app/actions/student';
import { Button } from '@/components/ui/button';
import { AvailabilityRequestFields } from '@/components/features/availability-request-fields';

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
			'id, title, subject, grade_range, description, duration_minutes, capacity, image_url, is_time_fixed, weeks'
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

		if (course.is_time_fixed) {
			const slotsString = availableSlots
				.map((slot) => `${slot.start}|${slot.end}`)
				.join(',');

			if (!slotsString) {
				throw new Error('등록된 고정 시간이 없습니다.');
			}

			await applyToCourse(course.id, slotsString);
			redirect('/student/applications');
			return;
		}

		const availabilityRaw = String(
			formData.get('availability_json') ?? '[]'
		);

		let availability: { day_of_week: number; start_time: string; end_time: string }[] = [];
		try {
			availability = JSON.parse(availabilityRaw);
		} catch (error) {
			console.error('availability parse error', error);
		}

		const slotsFromAvailability = buildSlotsFromDayTimeRanges(availability);
		if (slotsFromAvailability.length === 0) {
			throw new Error('가능 시간을 1개 이상 추가해주세요.');
		}

		const slotsString = slotsFromAvailability
			.map((slot) => `${slot.start}|${slot.end}`)
			.join(',');
		await applyToCourse(course.id, slotsString);
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
								{course.duration_minutes}분 · 정원 {course.capacity}
							</p>
							<div className='mt-2 flex flex-wrap gap-2 text-xs font-semibold'>
								<span className='rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[var(--primary)]'>
									{course.weeks}주 과정
								</span>
								<span className='rounded-full bg-slate-100 px-3 py-1 text-slate-700'>
									{course.is_time_fixed ? '시간 확정형' : '시간 협의형'}
								</span>
							</div>
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
						<CardTitle>
							{course.is_time_fixed
								? '확정된 일정으로 신청'
								: '가능한 시간 제출'}
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-4'>
						<form
							action={action}
							className='space-y-4'>
							{course.is_time_fixed ? (
								<div className='space-y-2 text-sm'>
									{(windows ?? []).length === 0 && (
										<p className='text-slate-600'>
											관리자가 아직 시간을 등록하지 않았습니다.
										</p>
									)}
									{windows?.map((w) => (
										<div
											key={w.id}
											className='flex items-center justify-between rounded-md border border-slate-200 px-3 py-2'>
											<span className='font-semibold text-slate-800'>
												{days[w.day_of_week]}
											</span>
											<span className='text-slate-700'>
												{w.start_time} - {w.end_time}
											</span>
										</div>
									))}
									<p className='text-xs text-slate-600'>
										위 일정으로 바로 신청합니다. 선택 항목은 없습니다.
									</p>
								</div>
							) : (
								<div className='space-y-3'>
									<p className='text-sm text-slate-700'>
										가능한 요일과 시간대를 1개 이상 추가해주세요.
									</p>
									<AvailabilityRequestFields />
									<p className='text-xs text-slate-600'>
										요일과 시간은 가장 가까운 날짜 기준으로 저장됩니다.
									</p>
								</div>
							)}
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
