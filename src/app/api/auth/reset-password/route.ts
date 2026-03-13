import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";

const schema = z.object({
  token: z.string().min(1, "토큰이 필요합니다"),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = schema.parse(body);

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "유효하지 않은 링크입니다" },
        { status: 400 },
      );
    }

    if (verificationToken.expires < new Date()) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "만료된 링크입니다. 다시 요청해주세요" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    });

    // 사용된 토큰 삭제
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({ message: "비밀번호가 변경되었습니다" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 },
      );
    }
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
