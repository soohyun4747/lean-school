import Link from 'next/link';

import { sendEmail } from '@/lib/email';
import { ContactForm, type ContactFormState } from './contact-form';

const contactPoints = [
	{
		title: '이메일',
		value: 'soohyun4747@gmail.com',
		href: 'mailto:soohyun4747@gmail.com',
	},
	{
		title: '전화',
		value: '02-123-4567',
		href: 'tel:+8221234567',
	},
	{
		title: '운영 시간',
		value: '평일 10:00 - 18:00',
	},
];

const contactEmail = contactPoints.find((item) => item.title === '이메일')?.value;

async function submitContact(
	_prevState: ContactFormState,
	formData: FormData
): Promise<ContactFormState> {
	'use server';

	const name = (formData.get('name')?.toString() ?? '').trim();
	const email = (formData.get('email')?.toString() ?? '').trim();
	const message = (formData.get('message')?.toString() ?? '').trim();

	if (!name || !email || !message) {
		return {
			success: false,
			error: '모든 필수 항목을 입력해 주세요.',
		};
	}

	try {
		await sendEmail({
			to: contactEmail ?? 'hello@leanschool.kr',
			subject: `[문의] ${name || '알 수 없음'}님이 남긴 문의`,
			text: `보낸 사람: ${name || '미기재'}\n이메일: ${email || '미기재'}\n\n${message || '(내용 없음)'}`,
		});

		return { success: true };
	} catch (error) {
		console.error('문의 전송 실패', error);
		return {
			success: false,
			error: '문의 전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
		};
	}
}

export default function ContactPage() {
	return (
		<div className='mx-auto max-w-5xl px-4 py-12 space-y-10'>
			<div className='space-y-3'>
				<p className='text-sm font-semibold uppercase tracking-wide text-[var(--primary)]'>
					contact
				</p>
				<h1 className='text-3xl font-bold text-slate-900 md:text-4xl'>
					린스쿨 팀에 문의하기
				</h1>
				<p className='text-base text-slate-600'>
					궁금한 내용을 남겨주시면
					빠르게 연락드리겠습니다.
				</p>
			</div>

			<div className='grid gap-6 md:grid-cols-[1.2fr_0.8fr]'>
				<div className='rounded-2xl border border-[var(--primary-border)] bg-white p-6 shadow-sm'>
					<h2 className='text-lg font-semibold text-slate-900'>
						문의하기
					</h2>
					<p className='text-sm text-slate-600'>
						아래 정보를 작성해 주세요. 담당자가 확인 후
						연락드립니다.
					</p>
					<ContactForm action={submitContact} />
				</div>

				<div className='space-y-4'>
					<div className='rounded-2xl border border-[var(--primary-border)] bg-white p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-slate-900'>
							연락처
						</h3>
						<p className='text-sm text-slate-600'>
							편한 방법으로 연락 주세요.
						</p>
						<div className='mt-4 space-y-3'>
							{contactPoints.map((item) => (
								<div
									key={item.title}
									className='rounded-lg border border-slate-100 bg-slate-50 px-4 py-3'>
									<p className='text-xs font-semibold uppercase tracking-wide text-[var(--primary)]'>
										{item.title}
									</p>
									{item.href ? (
										<Link
											href={item.href}
											className='text-sm font-medium text-slate-900 hover:text-[var(--primary)]'>
											{item.value}
										</Link>
									) : (
										<p className='text-sm font-medium text-slate-900'>
											{item.value}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
					<div className='rounded-2xl border border-[var(--primary-border)] bg-white p-6 shadow-sm'>
						<h3 className='text-lg font-semibold text-slate-900'>
							바로가기
						</h3>
						<div className='mt-4 flex flex-col gap-3'>
							<Link
								href='/'
								className='text-sm text-[var(--primary)] hover:underline'>
								홈으로 돌아가기
							</Link>
							<Link
								href='/auth/login'
								className='text-sm text-[var(--primary)] hover:underline'>
								로그인하러 가기
							</Link>
							<Link
								href='/classes'
								className='text-sm text-[var(--primary)] hover:underline'>
								수업 살펴보기
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
