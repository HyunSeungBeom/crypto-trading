"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("올바른 이메일을 입력하세요"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordFormValues) {
    setError("");

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">이메일 전송 완료</h1>
          <p className="mt-2 text-sm text-muted">
            등록된 이메일이라면 비밀번호 재설정 링크가 전송되었습니다.
            <br />
            이메일을 확인해주세요.
          </p>
        </div>
        <Link
          href="/login"
          className="block w-full rounded-lg border border-border py-2.5 text-center font-medium hover:bg-card transition-colors"
        >
          로그인으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
        <p className="mt-1 text-sm text-muted">
          가입한 이메일을 입력하면 재설정 링크를 보내드립니다
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-danger">
              {errors.email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "전송 중..." : "재설정 링크 전송"}
        </button>
      </form>

      <p className="text-center text-sm text-muted">
        <Link href="/login" className="text-primary hover:underline">
          로그인으로 돌아가기
        </Link>
      </p>
    </div>
  );
}
