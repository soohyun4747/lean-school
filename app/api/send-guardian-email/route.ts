import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(request: Request) {
	if (!resend) {
		return NextResponse.json(
			{ error: '이메일 발송 설정이 되어 있지 않습니다.' },
			{ status: 500 }
		);
	}

	const { guardianEmail, studentName, confirmUrl } = await request.json();

	if (!guardianEmail || !confirmUrl) {
		return NextResponse.json(
			{ error: '필수 파라미터가 누락되었습니다.' },
			{ status: 400 }
		);
	}

	const subject = '보호자 동의 요청';
	const body = `안녕하세요, 귀하의 자녀 ${studentName ?? ''}님이
린스쿨(RINSchool) 서비스 이용을 신청하였습니다.

본 서비스는 만 14세 미만 아동의 개인정보를 수집·이용하는 경우,
법정대리인의 동의가 필요합니다.

아래 내용을 확인하신 후,
동의하실 경우 ‘동의하기’ 버튼을 눌러주시기 바랍니다.

${confirmUrl}
`;

	try {
		await resend.emails.send({
			from: 'RIN School <no-reply@updates.rinschool.com>',
			to: guardianEmail,
			subject,
			text: body,
			html: `
        <div style="font-family: Pretendard, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <h1 style="font-size: 20px; margin: 0 0 12px; color: #0f172a;">
    법정대리인 동의 요청
  </h1>

  <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 12px;">
    안녕하세요.<br />
    귀하의 자녀 <strong>${studentName ?? ''}</strong> 님이<br />
    <strong>린스쿨(RINSchool)</strong> 서비스 이용을 신청하였습니다.
  </p>

  <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0 0 12px;">
    본 서비스는 <strong>만 14세 미만 아동</strong>의 개인정보를 수집·이용하는 경우,<br />
    <strong>법정대리인의 동의</strong>가 필요합니다.
  </p>

  <p style="font-size: 14px; color: #334155; line-height: 1.6; margin: 0;">
    아래 버튼을 눌러 동의 내용을 확인하신 후,<br />
    동의하실 경우 동의 절차를 완료해 주시기 바랍니다.
  </p>

  <a
    href="${confirmUrl}"
    style="display: inline-block; margin-top: 20px; padding: 12px 18px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center;"
  >
    자녀의 서비스 이용에 동의합니다
  </a>

  <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-top: 20px;">
    ※ 본 동의는 전자적 방식으로 기록·보관되며,<br />
    동의하지 않으실 경우 서비스 이용이 제한될 수 있습니다.
  </p>
</div>

      `,
		});

		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error('Failed to send guardian email', error);
		return NextResponse.json(
			{ error: '이메일 발송에 실패했습니다.' },
			{ status: 500 }
		);
	}
}
