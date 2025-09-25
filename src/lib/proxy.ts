import axios, { Method } from "axios";

const TARGET = process.env.TARGET_API_BASE || "https://api.savitarrealty.com";

export function setCorsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
}

export async function handleProxy(
  req: Request,
  path: string,
  method: Method = "GET"
): Promise<Response> {
  const origin = req.headers.get("origin") || "*";
  const url = `${TARGET}/api/v1/${path}`;
  const searchParams = Object.fromEntries(new URL(req.url).searchParams);

  try {
    let response;
    if (method === "POST") {
      const body = await req.json();
      response = await axios.post(url, body, {
        params: searchParams,
        headers: {
          "Content-Type": "application/json",
          ...(req.headers.get("authorization")
            ? { Authorization: req.headers.get("authorization") }
            : {}),
        },
      });
    } else {
      response = await axios.get(url, {
        params: searchParams,
        headers: {
          ...(req.headers.get("authorization")
            ? { Authorization: req.headers.get("authorization") }
            : {}),
        },
      });
    }

    return new Response(JSON.stringify(response.data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...setCorsHeaders(origin),
      },
    });
  } catch (err: unknown) {
    // Helper type guard for Axios errors
    const axiosError = err as {
      response?: { status?: number; data?: unknown };
      message?: string;
    };

    const status = axiosError.response?.status ?? 500;
    const data = axiosError.response?.data ?? {
      message: axiosError.message ?? "Unknown error",
    };

    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  }
}
