import type { Metadata } from "next";
import { openApiSpec } from "@/lib/openapi";

export const metadata: Metadata = { title: "Tài liệu API | Thiền Tôn Phật Quang" };

type Op = {
  summary: string;
  description?: string;
  requestBody?: unknown;
  parameters?: readonly { name: string; in: string; required?: boolean }[];
  responses: Record<string, { description: string }>;
};

const EXAMPLES: Record<string, string> = {
  "POST /api/v1/registrations": `{
  "event_id": "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b",
  "full_name": "Nguyễn Văn An",
  "phone": "0912345678",
  "birth_year": 1985,
  "gender": "nam",
  "is_first_time": true
}`,
  "POST /api/v1/registrations/lookup": `{ "code": "PQ-7K3M9X", "phone": "0912345678" }`,
  "POST /api/v1/registrations/cancel": `{ "code": "PQ-7K3M9X", "phone": "0912345678" }`,
};

const METHOD_STYLE: Record<string, string> = {
  get: "bg-[#E8F0DE] text-leaf",
  post: "bg-[#F3E6C6] text-saffron-ink",
};

export default function ApiDocsPage() {
  const paths = openApiSpec.paths as unknown as Record<string, Record<string, Op>>;

  return (
    <article className="max-w-4xl">
      <p className="eyebrow">Dành cho lập trình viên</p>
      <h1 className="mt-1 text-3xl sm:text-4xl">{openApiSpec.info.title}</h1>
      <p className="mt-3 text-muted">{openApiSpec.info.description}</p>
      <p className="mt-3">
        Đặc tả OpenAPI 3.0:{" "}
        <a href="/api/v1/openapi.json" className="font-semibold text-saffron-ink underline underline-offset-4">
          /api/v1/openapi.json
        </a>{" "}
        (mở bằng Swagger Editor hoặc nhập vào Postman).
      </p>

      <div className="mt-10 space-y-6">
        {Object.entries(paths).flatMap(([path, ops]) =>
          Object.entries(ops).map(([method, op]) => {
            const key = `${method.toUpperCase()} ${path}`;
            return (
              <section key={key} className="rounded-xl border border-line bg-paper p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded px-2.5 py-0.5 font-mono text-sm font-bold uppercase ${METHOD_STYLE[method] ?? ""}`}>
                    {method}
                  </span>
                  <code className="font-mono text-[15px]">{path}</code>
                </div>
                <h2 className="mt-3 text-xl">{op.summary}</h2>
                {op.description && <p className="mt-1 text-muted">{op.description}</p>}

                {op.parameters && op.parameters.length > 0 && (
                  <p className="mt-3 text-sm">
                    Tham số:{" "}
                    {op.parameters.map((p) => (
                      <code key={p.name} className="mr-2 rounded bg-mist px-1.5 py-0.5">
                        {p.name} ({p.in}
                        {p.required ? ", bắt buộc" : ""})
                      </code>
                    ))}
                  </p>
                )}

                {EXAMPLES[key] && (
                  <>
                    <p className="mt-4 text-sm font-semibold">Ví dụ nội dung gửi (JSON)</p>
                    <pre className="mt-1 overflow-x-auto rounded-lg bg-pine p-4 text-sm text-[#FAF7EF]">{EXAMPLES[key]}</pre>
                  </>
                )}

                <table className="mt-4 w-full text-left text-sm">
                  <thead className="text-muted">
                    <tr>
                      <th className="w-20 py-1 font-medium">Mã</th>
                      <th className="py-1 font-medium">Ý nghĩa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {Object.entries(op.responses).map(([status, r]) => (
                      <tr key={status}>
                        <td className="py-1.5 font-mono">{status}</td>
                        <td className="py-1.5">{r.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            );
          })
        )}
      </div>
    </article>
  );
}
