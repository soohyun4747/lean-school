'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';

export type ContactFormState = {
	success: boolean;
	error?: string;
};

const initialState: ContactFormState = {
	success: false,
	error: undefined,
};

function SubmitButton() {
	const { pending } = useFormStatus();

	return (
		<button
			type='submit'
			disabled={pending}
			className='inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70'>
			{pending ? '전송 중...' : '문의하기'}
		</button>
	);
}

type ContactFormProps = {
	action: (
		prevState: ContactFormState,
		formData: FormData
	) => Promise<ContactFormState>;
};

export function ContactForm({ action }: ContactFormProps) {
	const [state, formAction] = useFormState<ContactFormState>(
		action,
		initialState
	);
	const formRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (state.success) {
			formRef.current?.reset();
		}
	}, [state.success]);

	return (
		<form
			ref={formRef}
			action={formAction}
			className='mt-6 grid gap-4'>
			{state.success && (
				<div className='rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800'>
					문의가 접수되었습니다. 빠르게 확인 후 연락드리겠습니다.
				</div>
			)}
			{state.error && (
				<div className='rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
					{state.error}
				</div>
			)}
			<div className='space-y-2'>
				<label className='text-sm font-medium text-slate-700'>
					성함
				</label>
				<input
					name='name'
					className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]'
					placeholder='이름을 입력하세요'
					required
				/>
			</div>
			<div className='space-y-2'>
				<label className='text-sm font-medium text-slate-700'>
					이메일
				</label>
				<input
					name='email'
					type='email'
					className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]'
					placeholder='contact@example.com'
					required
				/>
			</div>
			<div className='space-y-2'>
				<label className='text-sm font-medium text-slate-700'>
					문의 내용
				</label>
				<textarea
					name='message'
					rows={4}
					className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-soft)]'
					placeholder='필요한 수업, 도입 일정 등을 알려주세요.'
					required
				/>
			</div>
			<SubmitButton />
		</form>
	);
}
