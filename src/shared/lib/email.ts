import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY 환경변수가 설정되지 않았습니다");
  return new Resend(key);
}

const FROM_EMAIL = process.env.EMAIL_FROM || "CryptoSim <noreply@resend.dev>";

export async function sendPasswordResetEmail(
  email: string,
  token: string,
) {
  const baseUrl = process.env.AUTH_URL || "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "[CryptoSim] 비밀번호 재설정",
    html: `
      <div style="max-width: 480px; margin: 0 auto; font-family: sans-serif;">
        <h2>비밀번호 재설정</h2>
        <p>아래 버튼을 클릭하여 비밀번호를 재설정하세요.</p>
        <p>이 링크는 1시간 동안 유효합니다.</p>
        <a href="${resetUrl}"
           style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin: 16px 0;">
          비밀번호 재설정
        </a>
        <p style="color: #888; font-size: 14px;">
          본인이 요청하지 않았다면 이 이메일을 무시하세요.
        </p>
      </div>
    `,
  });
}
