import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/time';

type InstructorProfile = {
	id: string;
	name: string;
	phone: string | null;
	created_at: string;
};

export default async function AdminInstructorsPage() {
	const { profile } = await requireSession();
	requireRole(profile.role, ['admin']);
	const supabase = await getSupabaseServerClient();

	const { data: instructors } = await supabase
		.from('profiles')
		.select('id, name, phone, created_at')
		.eq('role', 'instructor')
		.order('created_at', { ascending: false });

	const { data: subjects } = await supabase
		.from('instructor_subjects')
		.select('instructor_id, subject, grade_range');

	const { data: availability } = await supabase
		.from('availability_slots')
		.select('user_id')
		.eq('role', 'instructor');

	const { data: matches } = await supabase
		.from('matches')
		.select('id, instructor_id, status');

	const subjectMap = new Map<string, { subject: string; grade_range: string }[]>();
	(subjects ?? []).forEach((row) => {
		const list = subjectMap.get(row.instructor_id) ?? [];
		list.push({ subject: row.subject, grade_range: row.grade_range });
		subjectMap.set(row.instructor_id, list);
	});

	const availabilityCount = new Map<string, number>();
	(availability ?? []).forEach((slot) => {
		availabilityCount.set(slot.user_id, (availabilityCount.get(slot.user_id) ?? 0) + 1);
	});

	const matchCount = new Map<string, { total: number; confirmed: number }>();
	(matches ?? []).forEach((m) => {
		const entry = matchCount.get(m.instructor_id) ?? { total: 0, confirmed: 0 };
		entry.total += 1;
		if (m.status === 'confirmed') entry.confirmed += 1;
		matchCount.set(m.instructor_id, entry);
	});

	const instructorRows: InstructorProfile[] = instructors ?? [];
	const totalSubjects = subjects?.length ?? 0;
	const totalSlots = availability?.length ?? 0;

	return (
		<div className='space-y-6'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-bold text-slate-900'>강사 관리</h1>
				<p className='text-sm text-slate-600'>강사의 담당 과목, 가능 시간, 배정 현황을 확인하세요.</p>
			</div>

			<div className='grid gap-3 md:grid-cols-3'>
				<Card>
					<CardHeader>
						<CardTitle>강사 수</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-slate-900'>
						{instructorRows.length}명
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>등록 과목</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-slate-900'>
						{totalSubjects}개
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>가능 시간 슬롯</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-[var(--primary)]'>
						{totalSlots}개
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>강사 목록</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					{instructorRows.length === 0 && <p className='text-sm text-slate-600'>등록된 강사가 없습니다.</p>}
					<div className='space-y-2'>
						{instructorRows.map((instructor) => {
							const subjectsForInstructor = subjectMap.get(instructor.id) ?? [];
							const slots = availabilityCount.get(instructor.id) ?? 0;
							const matchesForInstructor = matchCount.get(instructor.id) ?? { total: 0, confirmed: 0 };
							return (
								<div
									key={instructor.id}
									className='flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between'>
									<div>
										<p className='text-sm font-semibold text-slate-900'>{instructor.name || '이름 미입력'}</p>
										<p className='text-xs text-slate-600'>가입일 {formatDateTime(new Date(instructor.created_at))}</p>
									</div>
									<div className='flex flex-wrap items-center gap-2 text-xs'>
										<Badge>{instructor.phone || '연락처 없음'}</Badge>
										<Badge>과목 {subjectsForInstructor.length}개</Badge>
										<Badge>가능 슬롯 {slots}개</Badge>
										{matchesForInstructor.total > 0 && (
											<Badge variant='success'>배정 {matchesForInstructor.confirmed}/{matchesForInstructor.total}</Badge>
										)}
									</div>
									{subjectsForInstructor.length > 0 && (
										<ul className='grid gap-1 rounded-md bg-slate-50 p-2 text-xs text-slate-700 md:min-w-[320px] md:grid-cols-2'>
											{subjectsForInstructor.map((subject) => (
												<li key={`${instructor.id}-${subject.subject}-${subject.grade_range}`}>
													{subject.subject} · {subject.grade_range}
												</li>
											))}
										</ul>
									)}
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
