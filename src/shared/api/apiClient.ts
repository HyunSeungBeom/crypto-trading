import ky from "ky";
import { toast } from "sonner";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiClient = ky.create({
  prefixUrl: "/",
  timeout: 10000,
  hooks: {
    beforeRequest: [
      (request) => {
        request.headers.set("X-Request-ID", crypto.randomUUID());

        if (process.env.NODE_ENV === "development") {
          console.debug(`[API] ${request.method} ${request.url}`);
        }
      },
    ],
    afterResponse: [
      async (_request, _options, response) => {
        if (response.status === 401) {
          window.location.href = "/login";
        }

        if (response.status === 403) {
          toast.error("접근 권한이 없습니다");
        }

        if (!response.ok) {
          const body = await response
            .json()
            .catch(() => ({} as Record<string, string>));
          const message =
            (body as Record<string, string>)?.error || "오류가 발생했습니다";
          toast.error(message);
          throw new ApiError(
            response.status,
            message,
            (body as Record<string, string>)?.code,
          );
        }
      },
    ],
  },
});

export default apiClient;
