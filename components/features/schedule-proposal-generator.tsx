'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
	confirmScheduleFromProposal,
	generateScheduleProposals,
	type ConfirmScheduleResult,
	type ScheduleProposal,
	type ScheduleProposalResult,
} from '@/app/actions/admin';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	CardContent,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { formatDateTime } from '@/lib/time';

type ApplicationRow = {
	id: string;
	student_id: string;
	status: string;
	created_at: string;
	application_time_choices: { window_id: string }[];
};

type WindowRow = {
	id: string;
	day_of_week: number;
	start_time: string;
	end_time: string;
	instructor_id: string | null;
	instructor_name: string | null;
};

type ProfileRow = {
	id: string;
	name: string | null;
	phone: string | null;
	birthdate: string | null;
};

type Props = {
	course: {
		id: string;
		duration_minutes: number;
		capacity: number;
	};
	windows: WindowRow[];
	applications: ApplicationRow[];
	profiles: ProfileRow[];
};

const days = ['일', '월', '화', '수', '목', '금', '토'];

function calculateAge(birthdate: string | null) {
	if (!birthdate) return null;
	const date = new Date(birthdate);
	if (Number.isNaN(date.getTime())) return null;

	const today = new Date();
	let age = today.getFullYear() - date.getFullYear();
	const monthDiff = today.getMonth() - date.getMonth();
	if (
		monthDiff < 0 ||
		(monthDiff === 0 && today.getDate() < date.getDate())
	) {
		age -= 1;
	}
	return age;
}

function windowLabel(w: WindowRow) {
	return `${days[w.day_of_week]} ${w.start_time} - ${w.end_time}`;
}

export default function ScheduleProposalGenerator({
	course,
	windows,
	applications,
	profiles,
}: Props) {
	const router = useRouter();
	const profileMap = useMemo(
		() => new Map(profiles.map((p) => [p.id, p])),
		[profiles]
	);
	const applicationByStudent = useMemo(() => {
		const map = new Map<string, ApplicationRow>();
		applications.forEach((app) => {
			if (!map.has(app.student_id)) {
				map.set(app.student_id, app);
			}
		});
		return map;
	}, [applications]);
	const windowMap = useMemo(
		() => new Map(windows.map((w) => [w.id, w])),
		[windows]
	);

	const [result, setResult] = useState<ScheduleProposalResult>({
		proposals: [],
	});
	const [isGenerating, startGenerating] = useTransition();
	const [isConfirming, startConfirming] = useTransition();
	const [confirmingId, setConfirmingId] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const instructorLabel = (w: WindowRow) =>
		w.instructor_id
			? profileMap.get(w.instructor_id)?.name ?? w.instructor_id
			: w.instructor_name || '미지정';

	const availabilityForStudent = (studentId: string) => {
		const app = applicationByStudent.get(studentId);
		const choices = app?.application_time_choices ?? [];
		const labels = choices.map((choice) => {
			const window = windowMap.get(choice.window_id);
			return window ? windowLabel(window) : '삭제된 시간';
		});
		return labels.length > 0 ? labels.join(', ') : '선택 없음';
	};

	const handleGenerate = () => {
		startGenerating(async () => {
			setError(null);
			setMessage(null);
			const response = await generateScheduleProposals(course.id);
			setResult(response);
			if (response.error) {
				setError(response.error);
			} else if (response.proposals.length === 0) {
				setMessage('조건에 맞는 추천 시간표가 없습니다.');
			}
		});
	};

	const handleConfirm = (proposal: ScheduleProposal) => {
		startConfirming(async () => {
			setConfirmingId(proposal.window_id);
			setError(null);
			const payload = {
				slot_start_at: proposal.slot_start_at,
				slot_end_at: proposal.slot_end_at,
				instructor_id: proposal.instructor_id,
				instructor_name: proposal.instructor_name,
				student_ids: proposal.students.map((s) => s.student_id),
			};
			const response: ConfirmScheduleResult =
				await confirmScheduleFromProposal(course.id, payload);
			if (response.error) {
				setError(response.error);
			} else {
				setMessage('일정을 확정했습니다.');
				router.refresh();
			}
			setConfirmingId(null);
		});
	};

	return (
		<>
			<CardHeader className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div className='space-y-1'>
					<CardTitle>가능한 시간표 생성</CardTitle>
					<p className='text-sm text-slate-600'>
						신청한 시간대와 정원을 기준으로 추천 시간표를 만들고
						확정할 수 있습니다. 생성된 추천안은 DB에 저장되지 않으며,
						확정한 일정만 저장됩니다.
					</p>
				</div>
				<Button onClick={handleGenerate} disabled={isGenerating}>
					{isGenerating ? '생성 중...' : '생성하기'}
				</Button>
			</CardHeader>
			<CardContent className='space-y-4 text-sm'>
				{result.generated_at && (
					<p className='text-xs text-slate-500'>
						{formatDateTime(new Date(result.generated_at))}에
						생성된 추천안
					</p>
				)}
				{error && (
					<p className='text-xs font-semibold text-red-600'>
						{error}
					</p>
				)}
				{message && !error && (
					<p className='text-xs text-slate-600'>{message}</p>
				)}
				{result.proposals.length === 0 && !error && !message && (
					<p className='text-slate-600'>
						아직 제안된 시간표가 없습니다. 생성하기 버튼을 눌러 추천
						일정을 받아보세요.
					</p>
				)}
				{result.proposals.map((proposal) => {
					const windowInfo = windowMap.get(proposal.window_id);
					const instructorText = windowInfo
						? instructorLabel(windowInfo)
						: proposal.instructor_name ?? '미지정';
					return (
						<div
							key={`${proposal.window_id}-${proposal.slot_start_at}`}
							className='space-y-3 rounded-md border border-slate-200 bg-white p-4 shadow-sm'>
							<div className='flex flex-wrap items-center justify-between gap-2'>
								<div>
									<p className='text-sm font-semibold text-slate-900'>
										{formatDateTime(
											new Date(proposal.slot_start_at)
										)}{' '}
										~{' '}
										{formatDateTime(
											new Date(proposal.slot_end_at)
										)}
									</p>
									<p className='text-xs text-slate-600'>
										강사:{' '}
										{instructorText}
									</p>
								</div>
								<Badge variant='warning'>제안됨</Badge>
							</div>
							<div className='space-y-2'>
								<p className='text-xs font-semibold text-slate-700'>
									배치된 학생 ({proposal.students.length} /{' '}
									{proposal.capacity})
								</p>
								{proposal.students.length === 0 ? (
									<p className='text-xs text-slate-600'>
										배치할 학생이 없습니다.
									</p>
								) : (
									<ul className='space-y-2'>
										{proposal.students.map((student) => {
											const profile = profileMap.get(
												student.student_id
											);
											const age = calculateAge(
												profile?.birthdate ?? null
											);
											const availability =
												availabilityForStudent(
													student.student_id
												);
											return (
												<li
													key={student.student_id}
													className='rounded-md border border-slate-100 px-3 py-2'>
													<div className='flex flex-wrap items-center justify-between gap-2'>
														<div>
															<p className='text-sm font-semibold text-slate-900'>
																{profile?.name ??
																	student.student_id}
															</p>
															<p className='text-xs text-slate-600'>
																{profile?.phone ??
																	'연락처 없음'}{' '}
																·{' '}
																{age !== null
																	? `${age}세`
																	: '나이 정보 없음'}
															</p>
														</div>
														<span className='text-[11px] text-slate-500'>
															가능 시간대:{' '}
															{availability}
														</span>
													</div>
												</li>
											);
										})}
									</ul>
								)}
							</div>
							<div className='flex justify-end'>
								<Button
									variant='secondary'
									onClick={() => handleConfirm(proposal)}
									disabled={
										proposal.students.length === 0 ||
										isConfirming
									}>
									{confirmingId === proposal.window_id
										? '확정 중...'
										: '이 일정 확정'}
								</Button>
							</div>
						</div>
					);
				})}
			</CardContent>
		</>
	);
}
