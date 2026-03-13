"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">유효하지 않은 링크</h1>
        <p className="text-sm text-muted">
          비밀번호 재설정 링크가 올바르지 않습니다.
        </p>
        <Link
          href="/forgot-password"
          className="block w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover transition-colors"
        >
          다시 요청하기
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-2xl font-bold">비밀번호 변경 완료</h1>
        <p className="text-sm text-muted">
          새 비밀번호로 로그인해주세요.
        </p>
        <Link
          href="/login"
          className="block w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover transition-colors"
        >
          로그인
        </Link>
      </div>
    );
  }

  async function onSubmit(values: ResetPasswordFormValues) {
    setError("");

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error);
      return;
    }

    setSuccess(true);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">새 비밀번호 설정</h1>
        <p className="mt-1 text-sm text-muted">
          새로운 비밀번호를 입력해주세요
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-danger/10 p-3 text-sm text-danger">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium"
          >
            새 비밀번호
          </label>
          <input
            id="password"
            type="password"
            {...register("password")}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-danger">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1 block text-sm font-medium"
          >
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register("confirmPassword")}
            className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none focus:border-primary"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary py-2.5 font-medium text-white hover:bg-primary-hover disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "변경 중..." : "비밀번호 변경"}
        </button>
      </form>
    </div>
  );
}
