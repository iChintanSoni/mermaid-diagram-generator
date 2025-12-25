type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

type ErrorResponse = {
  success: false;
  message: string;
};

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

type Status = "idle" | "loading" | "success" | "failure";

async function api<T = any>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
): Promise<ApiResponse<T>> {
  const isFormData = init?.body instanceof FormData;

  // Start with default headers
  const headers: HeadersInit = isFormData
    ? init?.headers ?? {}
    : {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      };

  // Prepare final init object
  const finalInit: RequestInit = {
    ...init,
    credentials: "include",
    headers,
  };

  // If not FormData, convert object to JSON string (if needed)
  if (!isFormData && init?.body && typeof init.body === "object") {
    finalInit.body = JSON.stringify(init.body);
  }

  try {
    const response = await fetch(input, finalInit);
    const json = await response.json();
    const successResponse: SuccessResponse<any> = {
      data: json,
      success: true,
      message: "Agent is available.",
    };
    return successResponse;
  } catch (error) {
    const errorResponse: ErrorResponse = {
      success: false,
      message: (error as Error).message,
    };
    return errorResponse;
  }
}

async function get<T = unknown>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  let baseRequestInit: RequestInit = {
    method: "GET",
  };
  if (init) baseRequestInit = { ...baseRequestInit, ...init };
  return await api<T>(input, baseRequestInit);
}

async function post<T = unknown>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  let baseRequestInit: RequestInit = {
    method: "POST",
  };
  if (init) baseRequestInit = { ...baseRequestInit, ...init };
  return await api<T>(input, baseRequestInit);
}

async function put<T = unknown>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  let baseRequestInit: RequestInit = {
    method: "PUT",
  };
  if (init) baseRequestInit = { ...baseRequestInit, ...init };
  return await api<T>(input, baseRequestInit);
}

async function deleteApi<T = unknown>(
  input: string | URL | globalThis.Request,
  init?: RequestInit
) {
  let baseRequestInit: RequestInit = {
    method: "DELETE",
  };
  if (init) baseRequestInit = { ...baseRequestInit, ...init };
  return await api<T>(input, baseRequestInit);
}

export type { Status };
export { get, post, put, deleteApi };
