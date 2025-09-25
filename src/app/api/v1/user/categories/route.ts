import { handleProxy, setCorsHeaders } from "@/lib/proxy";

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "*";
  return new Response(null, { status: 204, headers: setCorsHeaders(origin) });
}

export async function GET(req: Request) {
  return handleProxy(req, "user/categories", "GET");
}
