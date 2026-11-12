import { NextResponse } from "next/server";
import { openApiSpec } from "@/lib/openapi";

/** GET /api/v1/openapi.json: tài liệu API theo chuẩn OpenAPI 3.0 (mở được bằng Swagger Editor, Postman). */
export function GET() {
  return NextResponse.json(openApiSpec);
}
