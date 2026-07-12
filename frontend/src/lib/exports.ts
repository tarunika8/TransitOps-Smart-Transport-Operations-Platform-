export function exportCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    alert("No data to export.");
    return;
  }
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(title: string, rows: Record<string, unknown>[]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const headers = rows.length ? Object.keys(rows[0]) : [];
  const html = `<!doctype html><html><head><title>${title}</title>
  <style>
    body{font-family:-apple-system,system-ui,sans-serif;padding:32px;color:#111}
    h1{font-size:22px;margin:0 0 16px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th,td{border:1px solid #ddd;padding:8px;text-align:left}
    th{background:#f4f4f5}
    .meta{color:#666;font-size:11px;margin-bottom:16px}
  </style></head><body>
  <h1>${title}</h1>
  <div class="meta">Generated ${new Date().toLocaleString()} · TransitOps</div>
  <table><thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
  <tbody>${rows
    .map((r) => `<tr>${headers.map((h) => `<td>${r[h] ?? ""}</td>`).join("")}</tr>`)
    .join("")}</tbody></table>
  <script>window.onload=()=>{window.print()}</script>
  </body></html>`;
  w.document.write(html);
  w.document.close();
}
