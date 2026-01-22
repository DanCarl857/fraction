import { z } from "zod";

import { createFetcher } from "./fetcher";

const baseFetcher = createFetcher({});

export const apiFetch = async <T extends z.ZodType>(
  options: Parameters<typeof baseFetcher<T>>[0],
  retryCount?: number,
) => {
  return baseFetcher<T>(options, retryCount);
};