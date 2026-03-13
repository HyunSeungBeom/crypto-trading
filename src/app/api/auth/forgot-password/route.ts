import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { sendPasswordResetEmail } from "@/shared/lib/email";

const schema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // 사용자 존재 여부와 관계없이 동일한 응답 (보안)
    if (user) {
      // 기존 토큰 삭제
      await prisma.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // 새 토큰 생성 (1시간 유효)
      const token = randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: { identifier: email, token, expires },
      });

      await sendPasswordResetEmail(email, token);
    }

    return NextResponse.json({
      message: "이메일이 등록되어 있다면 비밀번호 재설정 링크가 전송됩니다",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
