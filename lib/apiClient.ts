type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string | null;
  body?: Record<string, unknown>;
};

type ApiError = Error & {
  status?: number;
  details?: unknown;
};

const getApiBaseUrl = () => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not set.");
  }

  return baseUrl.replace(/\/$/, "");
};

const parseJson = async (response: Response) => {
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  return response.json();
};

const buildError = async (response: Response) => {
  const data = await parseJson(response);
  const message =
    data && typeof data === "object" && "message" in data
      ? String((data as { message: string }).message)
      : `Request failed with status ${response.status}`;
  const error: ApiError = new Error(message);
  error.status = response.status;
  if (data && typeof data === "object" && "details" in data) {
    error.details = (data as { details?: unknown }).details;
  }

  return error;
};

export const apiRequest = async <T>(
  path: string,
  { method = "GET", token, body }: ApiRequestOptions = {}
): Promise<T> => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;

  const headers: HeadersInit = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await buildError(response);
  }

  const data = await parseJson(response);
  return data as T;
};
