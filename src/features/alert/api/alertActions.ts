"use server";

import { z } from "zod";
import { prisma, auth } from "@/shared/api/serverApi";
import type { PriceAlert } from "@/entities/alert";

const alertSchema = z.object({
  symbol: z.string().min(1),
  targetPrice: z.number().positive(),
  condition: z.enum(["ABOVE", "BELOW"]),
});

export async function fetchAlerts(): Promise<PriceAlert[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  const alerts = await prisma.priceAlert.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return alerts.map((a) => ({
    id: a.id,
    symbol: a.symbol,
    targetPrice: a.targetPrice,
    condition: a.condition as "ABOVE" | "BELOW",
    triggered: a.triggered,
    createdAt: a.createdAt.toISOString(),
  }));
}

export async function createAlert(params: {
  symbol: string;
  targetPrice: number;
  condition: "ABOVE" | "BELOW";
}): Promise<{ success: true; alert: PriceAlert } | { success: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "인증이 필요합니다" };
  }

  try {
    const data = alertSchema.parse(params);
    const alert = await prisma.priceAlert.create({
      data: { ...data, userId: session.user.id },
    });

    return {
      success: true,
      alert: {
        id: alert.id,
        symbol: alert.symbol,
        targetPrice: alert.targetPrice,
        condition: alert.condition as "ABOVE" | "BELOW",
        triggered: alert.triggered,
        createdAt: alert.createdAt.toISOString(),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: "알림 생성에 실패했습니다" };
  }
}

export async function deleteAlert(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "인증이 필요합니다" };
  }

  const alert = await prisma.priceAlert.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!alert) {
    return { success: false, error: "알림을 찾을 수 없습니다" };
  }

  await prisma.priceAlert.delete({ where: { id } });
  return { success: true };
}
