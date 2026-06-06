export interface SwaggerInfo {
  title?: string;
  version?: string;
  description?: string;
}

export interface SwaggerData {
  info?: SwaggerInfo;
  paths?: Record<
    string,
    Record<
      string,
      {
        summary?: string;
        tags?: string[];
        parameters?: Array<{
          name: string;
          in: string;
          required?: boolean;
          type?: string;
          schema?: {
            type: string;
          };
        }>;
        responses?: Record<string, { description: string }>;
      }
    >
  >;
  [key: string]: unknown;
}

export const parseSwaggerToHtml = (data: SwaggerData): string => {
  if (!data) return "<div>데이터가 없습니다.</div>";

  let html = `<div style="font-family: sans-serif; color: #334155; line-height: 1.2;">`;

  // 💡 데이터가 누락되어도 안전하게 기본값으로 대체 처리
  const title = data.info?.title || "가져온 API 문서";
  const version = data.info?.version || "1.0.0";
  const description = data.info?.description || "API 명세서입니다.";

  html += `<h1 style="font-size: 22px; font-weight: 800; margin-bottom: 4px; color: #0f172a;">${title} (v${version})</h1>`;
  html += `<p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">${description}</p>`;

  const paths = data.paths || {};

  for (const path in paths) {
    const methods = paths[path] || {};
    for (const method in methods) {
      const api = methods[method];
      if (!api) continue;

      const color = method.toLowerCase() === "get" ? "#3b82f6" : "#10b981";

      html += `<div style="margin-bottom: 16px; border-top: 1px solid #f1f5f9; padding-top: 12px;">`;
      html += `<h2 style="color: ${color}; font-size: 16px; font-weight: 700; margin: 0 0 4px 0; text-transform: uppercase;">${method.toUpperCase()} ${path}</h2>`;
      html += `<p style="font-size: 14px; font-weight: 600; color: #1e293b; margin: 0 0 8px 0;">${api.summary || "설명 없음"}</p>`;

      if (api.parameters && api.parameters.length > 0) {
        html += `
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed; margin: 0;">
            <thead>
              <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                <th style="padding: 6px; text-align: left; width: 25%;">이름</th>
                <th style="padding: 6px; text-align: left; width: 20%;">위치</th>
                <th style="padding: 6px; text-align: center; width: 15%;">필수</th>
                <th style="padding: 6px; text-align: left; width: 40%;">타입</th>
              </tr>
            </thead>
            <tbody>
              ${api.parameters
                .map(
                  (p) => `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 6px; font-family: monospace; font-weight: 600; color: #475569;">${p?.name || ""}</td>
                  <td style="padding: 6px; color: #64748b;">${p?.in || ""}</td>
                  <td style="padding: 6px; text-align: center;">${p?.required ? "✅" : "-"}</td>
                  <td style="padding: 6px; color: #64748b;">${p?.schema?.type || p?.type || "unknown"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <hr/>
        `;
      }
      html += `</div>`;
    }
  }

  html += `</div>`;
  return html;
};
