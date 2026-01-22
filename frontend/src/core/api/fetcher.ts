/* eslint-disable @typescript-eslint/no-explicit-any */
import type { AxiosRequestConfig, Method } from "axios";
import axios from "axios";
import snakecaseKeys from "snakecase-keys";
import { z } from "zod";

const MAX_RETRY_COUNT = 1;

interface Options<T extends z.ZodType> {
  endpoint: string;
  method?: Method;
  config?: Omit<AxiosRequestConfig, "headers">;
  configureHeaders?: (headers: Record<string, string>) => void;
  response: T;
}

export type Fetcher = <T extends z.ZodType>(
  options: Options<T>,
  retryCount?: number,
) => Promise<z.infer<T>>;

interface FetcherOptions {
  apiToken?: string | undefined;
  baseURL?: string | undefined;
}

function isAxiosStatus(error: unknown, status: number) {
  return axios.isAxiosError(error) && error.response?.status === status;
}

function shouldRetry(error: unknown) {
  // Never retry auth failures
  if (isAxiosStatus(error, 401)) return false;
  if (isAxiosStatus(error, 403)) return false;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    // Network / CORS / timeout (no response) => retryable
    if (!status) return true;

    // Don't retry any 4xx or 5xx errors
    if (status >= 400 && status < 600) return false;

    return false;
  }

  // Non-axios error: assume not retryable (or set true if you prefer)
  return false;
}

export function createFetcher({
  apiToken,
  baseURL,
}: FetcherOptions = {}): Fetcher {
  const resolvedBaseURL =
    baseURL ??
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    (import.meta.env.VITE_API_URL as string | undefined);

  if (!resolvedBaseURL) {
    throw new Error(
      "Missing VITE_API_BASE_URL (or VITE_API_URL) (or pass baseURL to createFetcher)",
    );
  }

  const baseHeaders: Record<string, string> = {
    Accept: "application/json",
    ...(apiToken ? { Authorization: `Bearer ${apiToken}` } : {}),
  };

  return async function fetchWithRetry<T extends z.ZodType>(
    {
      method = "get",
      config = {},
      endpoint,
      configureHeaders,
      response,
    }: Options<T>,
    retryCount = 0,
  ): Promise<z.infer<T>> {
    try {
      const headers: Record<string, string> = { ...baseHeaders };
      configureHeaders?.(headers);

      const url = endpoint.startsWith("http")
        ? endpoint
        : `${resolvedBaseURL}${endpoint}`;

      const axiosConfig: AxiosRequestConfig = { method, headers, ...config };

      const data = (axiosConfig as any).data;
      const isFormData =
        typeof FormData !== "undefined" && data instanceof FormData;

      if (!isFormData && !headers["Content-Type"]) {
        headers["Content-Type"] = "application/json";
      }

      if (isFormData) {
        delete headers["Content-Type"];
      }

      const res = await axios(url, axiosConfig);
      return await (response.parseAsync(res.data) as Promise<z.infer<T>>);
    } catch (error) {
      console.error(`Fetcher error (retry ${retryCount.toString()}):`, error);

      const m = (method || "get").toLowerCase();
      const isGet = m === "get";

      if (isGet && retryCount < MAX_RETRY_COUNT && shouldRetry(error)) {
        return fetchWithRetry(
          { method, config, endpoint, configureHeaders, response },
          retryCount + 1,
        );
      }

      throw error;
    }
  };
}

export function requestBody(body: Record<string, unknown> | unknown[]) {
  const processedBody = Array.isArray(body)
    ? body.map((item) =>
        typeof item === "object" && item !== null
          ? snakecaseKeys(item as Record<string, unknown>, { deep: true })
          : item,
      )
    : snakecaseKeys(body, { deep: true });
  return JSON.stringify(processedBody);
}

export function responseBody<T extends z.ZodType>(schema: T) {
  return schema;
}