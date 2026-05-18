import axios, { type AxiosRequestConfig } from "axios";
import { getCredentials } from "../store";

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; exception?: string; exc_type?: string }
      | undefined;

    return (
      data?.message ||
      data?.exception ||
      data?.exc_type ||
      error.message ||
      "ERPNext API request failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error.";
}

export async function frappeGet<T>(
  endpoint: string,
  config: AxiosRequestConfig = {},
) {
  const credentials = getCredentials();
  const response = await axios.get<T>(`${credentials.siteUrl}${endpoint}`, {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `token ${credentials.apiKey}:${credentials.apiSecret}`,
    },
  });

  return response.data;
}
