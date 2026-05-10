// Swagger 데이터 구조 정의
interface SwaggerInfo {
  title: string;
  version: string;
  description?: string;
}

interface SwaggerParameter {
  name: string;
  in: string;
  required?: boolean;
  type?: string;
  schema?: {
    type: string;
  };
}

interface SwaggerResponse {
  description: string;
}

interface SwaggerOperation {
  summary?: string;
  tags?: string[];
  parameters?: SwaggerParameter[];
  responses: Record<string, SwaggerResponse>;
}

interface SwaggerPaths {
  [path: string]: {
    [method: string]: SwaggerOperation;
  };
}

interface SwaggerData {
  info: SwaggerInfo;
  paths: SwaggerPaths;
}

export const parseSwaggerToHtml = (data: SwaggerData): string => {
  let html = `<div style="font-family: sans-serif; color: #334155; line-height: 1.2;">`; // line-height 줄임

  html += `<h1 style="font-size: 22px; font-weight: 800; margin-bottom: 4px; color: #0f172a;">${data.info.title} (v${data.info.version})</h1>`;
  html += `<p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">${data.info.description || "API 명세서입니다."}</p>`;

  const paths = data.paths;

  for (const path in paths) {
    const methods = paths[path];
    for (const method in methods) {
      const api = methods[method];
      const color = method.toLowerCase() === "get" ? "#3b82f6" : "#10b981";

      // 💡 여기서 margin-bottom을 32px -> 12px 정도로 대폭 줄였습니다.
      // 💡 <br><hr> 대신 테두리(border)만 사용하여 공간을 아낍니다.
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
                  <td style="padding: 6px; font-family: monospace; font-weight: 600; color: #475569;">${p.name}</td>
                  <td style="padding: 6px; color: #64748b;">${p.in}</td>
                  <td style="padding: 6px; text-align: center;">${p.required ? "✅" : "-"}</td>
                  <td style="padding: 6px; color: #64748b;">${p.schema?.type || p.type || "unknown"}</td>
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
