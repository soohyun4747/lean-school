import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireSession, requireRole } from '@/lib/auth';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import { formatDateTime } from '@/lib/time';

type StudentProfile = {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	birthdate: string | null;
	kakao_id: string | null;
	country: string | null;
	created_at: string;
};

export default async function AdminStudentsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
	const { profile } = await requireSession();
	requireRole(profile.role, ['admin']);
	const supabase = await getSupabaseServerClient();

	const { q = '' } = await searchParams;
	const searchKeyword = Array.isArray(q) ? q[0] : q;

	let query = supabase
		.from('profiles')
		.select('id, name, email, phone, birthdate, kakao_id, country, created_at')
		.eq('role', 'student')
		.order('created_at', { ascending: false });

	if (searchKeyword) {
		const keyword = `%${searchKeyword}%`;
		query = query.or(
			`name.ilike.${keyword},email.ilike.${keyword},phone.ilike.${keyword},kakao_id.ilike.${keyword},country.ilike.${keyword}`
		);
	}

	const { data: students, error } = await query;

	if (error) {
		console.error(error);
	}

	const studentRows: StudentProfile[] = students ?? [];

	return (
		<div className='space-y-6'>
			<div className='space-y-2'>
				<h1 className='text-2xl font-bold text-slate-900'>학생 관리</h1>
				<p className='text-sm text-slate-600'>학생 기본 정보와 연락처를 확인하고 검색할 수 있습니다.</p>
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
					<CardTitle>학생 목록</CardTitle>
				</CardHeader>
				<CardContent className='space-y-3'>
					{studentRows.length === 0 && <p className='text-sm text-slate-600'>등록된 학생이 없습니다.</p>}
					{studentRows.length > 0 && (
						<div className='overflow-hidden rounded-lg border border-slate-200'>
							<table className='min-w-full divide-y divide-slate-200 text-sm'>
								<thead className='bg-slate-50'>
									<tr>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>학생</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>이메일</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>연락처</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>생년월일</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>카카오톡 ID</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>거주지</th>
										<th className='px-4 py-2 text-left text-xs font-semibold text-slate-600'>가입일</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-slate-100 bg-white'>
									{studentRows.map((student) => {
										return (
											<tr key={student.id} className='hover:bg-slate-50'>
												<td className='px-4 py-2 font-semibold text-slate-900'>{student.name || '이름 미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{student.email}</td>
												<td className='px-4 py-2 text-slate-700'>{student.phone || '연락처 없음'}</td>
												<td className='px-4 py-2 text-slate-700'>{student.birthdate ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{student.kakao_id ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-700'>{student.country ?? '미입력'}</td>
												<td className='px-4 py-2 text-slate-500'>{formatDateTime(new Date(student.created_at))}</td>
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
