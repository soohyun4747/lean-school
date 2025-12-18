import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/time';

type StudentProfile = {
	id: string;
	name: string;
	phone: string | null;
	created_at: string;
};

export default async function AdminStudentsPage() {
	const { profile } = await requireSession();
	requireRole(profile.role, ['admin']);
	const supabase = await getSupabaseServerClient();

	const { data: students } = await supabase
		.from('profiles')
		.select('id, name, phone, created_at')
		.eq('role', 'student')
		.order('created_at', { ascending: false });

	const { data: applications } = await supabase
		.from('applications')
		.select('id, student_id, status');

	const { data: availability } = await supabase
		.from('availability_slots')
		.select('user_id')
		.eq('role', 'student');

	const appMap = new Map<string, { total: number; pending: number }>();
	(applications ?? []).forEach((app) => {
		const entry = appMap.get(app.student_id) ?? { total: 0, pending: 0 };
		entry.total += 1;
		if (app.status === 'pending') entry.pending += 1;
		appMap.set(app.student_id, entry);
	});

	const availabilityCount = new Map<string, number>();
	(availability ?? []).forEach((slot) => {
		availabilityCount.set(slot.user_id, (availabilityCount.get(slot.user_id) ?? 0) + 1);
	});

	const studentRows: StudentProfile[] = students ?? [];
	const totalApplications = applications?.length ?? 0;
	const pendingApplications = (applications ?? []).filter((app) => app.status === 'pending').length;

	return (
		<div className='space-y-6'>
			<div className='space-y-1'>
				<h1 className='text-2xl font-bold text-slate-900'>학생 관리</h1>
				<p className='text-sm text-slate-600'>학생 연락처, 신청 현황, 가능한 시간 슬롯을 한눈에 확인하세요.</p>
			</div>

			<div className='grid gap-3 md:grid-cols-3'>
				<Card>
					<CardHeader>
						<CardTitle>학생 수</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-slate-900'>
						{studentRows.length}명
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>총 신청</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-slate-900'>
						{totalApplications}건
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
						<CardTitle>대기 중</CardTitle>
					</CardHeader>
					<CardContent className='text-2xl font-bold text-[var(--primary)]'>
						{pendingApplications}건
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>학생 목록</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					{studentRows.length === 0 && <p className='text-sm text-slate-600'>등록된 학생이 없습니다.</p>}
					<div className='space-y-2'>
						{studentRows.map((student) => {
							const stat = appMap.get(student.id) ?? { total: 0, pending: 0 };
							const slots = availabilityCount.get(student.id) ?? 0;
							return (
								<div
									key={student.id}
									className='flex flex-col gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 shadow-sm md:flex-row md:items-center md:justify-between'>
									<div>
										<p className='text-sm font-semibold text-slate-900'>{student.name || '이름 미입력'}</p>
										<p className='text-xs text-slate-600'>가입일 {formatDateTime(new Date(student.created_at))}</p>
									</div>
									<div className='flex flex-wrap items-center gap-2 text-xs'>
										<Badge>{student.phone || '연락처 없음'}</Badge>
										<Badge>신청 {stat.total}건</Badge>
										{stat.pending > 0 && (
											<Badge variant='success'>대기 {stat.pending}건</Badge>
										)}
										<Badge>가능 슬롯 {slots}개</Badge>
									</div>
								</div>
							);
						})}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
