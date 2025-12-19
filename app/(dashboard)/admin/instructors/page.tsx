import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/time';

type InstructorProfile = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	birthdate: string | null;
	kakao_id: string | null;
	country: string | null;
	created_at: string;
};

export default async function AdminInstructorsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const { profile } = await requireSession();
	requireRole(profile.role, ['admin']);
	const supabase = await getSupabaseServerClient();

	const { q = '' } = await searchParams;
	const searchKeyword = Array.isArray(q) ? q[0] : q;

	let instructorQuery = supabase
		.from('profiles')
		.select('id, name, email, phone, birthdate, kakao_id, country, created_at')
		.eq('role', 'instructor')
		.order('created_at', { ascending: false });

	if (searchKeyword) {
		const keyword = `%${searchKeyword}%`;
		instructorQuery = instructorQuery.or(
			`name.ilike.${keyword},email.ilike.${keyword},phone.ilike.${keyword},kakao_id.ilike.${keyword},country.ilike.${keyword}`
		);
	}

	const [{ data: instructors }, { data: subjects }] = await Promise.all([
		instructorQuery,
		supabase
			.from('instructor_subjects')
			.select('instructor_id, subject, grade_range'),
	]);

	const subjectMap = new Map<string, { subject: string; grade_range: string }[]>();
	(subjects ?? []).forEach((row) => {
		const list = subjectMap.get(row.instructor_id) ?? [];
		list.push({ subject: row.subject, grade_range: row.grade_range });
		subjectMap.set(row.instructor_id, list);
	});

	const instructorRows: InstructorProfile[] = instructors ?? [];

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h1 className='text-2xl font-bold text-slate-900'>강사 관리</h1>
				<p className='text-sm text-slate-600'>강사 정보와 담당 과목을 확인하고 검색할 수 있습니다.</p>
				<form className='flex max-w-md items-center gap-2'>
					<input
						type='text'
						name='q'
						defaultValue={searchKeyword ?? ''}
						placeholder='이름, 이메일, 연락처, 카카오톡 ID 검색'
						className='w-full rounded-md border border-slate-200 px-3 py-2 text-sm'
					/>
					<button
						type='submit'
						className='rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white'>
						검색
					</button>
				</form>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>강사 목록</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					{instructorRows.length === 0 && <p className='text-sm text-slate-600'>등록된 강사가 없습니다.</p>}
					{instructorRows.length > 0 && (
						<div className='overflow-hidden rounded-lg border border-slate-200'>
							<table className='min-w-full divide-y divide-slate-200 text-sm'>
								<thead className='bg-slate-50'>
									<tr>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>강사</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>이메일</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>연락처</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>생년월일</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>카카오톡 ID</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>거주지</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>과목</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>가입일</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100 bg-white'>
									{instructorRows.map((instructor) => {
										const subjectsForInstructor = subjectMap.get(instructor.id) ?? [];
										return (
											<tr key={instructor.id} className='hover:bg-slate-50'>
												<td className='px-4 py-2 font-semibold text-slate-900'>{instructor.name || '이름 미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{instructor.email}</td>
												<td className='px-4 py-2 text-slate-700'>{instructor.phone || '연락처 없음'}</td>
												<td className='px-4 py-2 text-slate-700'>{instructor.birthdate ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{instructor.kakao_id ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{instructor.country ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>
													{subjectsForInstructor.length === 0 ? (
														<span className='text-slate-500'>미등록</span>
													) : (
														<ul className='list-disc space-y-1 pl-4'>
															{subjectsForInstructor.map((subject) => (
																<li key={`${instructor.id}-${subject.subject}-${subject.grade_range}`}>
																	{subject.subject} · {subject.grade_range}
																</li>
															))}
														</ul>
													)}
												</td>
												<td className='px-4 py-2 text-slate-500'>{formatDateTime(new Date(instructor.created_at))}</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
