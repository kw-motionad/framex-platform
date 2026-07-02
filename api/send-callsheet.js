export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) return res.status(503).json({ error: "RESEND_API_KEY not configured in Vercel environment variables." });

  const { sheet, recipients, projectTitle, fromName } = req.body || {};
  if (!sheet || !recipients?.length) return res.status(400).json({ error: "sheet and recipients required" });

  const from = fromName ? `${fromName} <onboarding@resend.dev>` : "Full Flux <onboarding@resend.dev>";
  const subject = `Call Sheet – ${projectTitle || "Production"} – ${sheet.date || "Shoot Day"}`;

  const scheduleRows = (sheet.schedule || []).map(b => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#A0A0C0;font-family:monospace;white-space:nowrap">${b.time || "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#E8E8F8;font-weight:600">${b.scene || "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#A0A0C0">${b.location || "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#A0A0C0">${b.cast || "—"}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#A0A0C0">${b.notes || ""}</td>
    </tr>`).join("");

  const callRows = (sheet.calls || []).map(c => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#E8E8F8;font-weight:600">${c.name || c.personId}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#A0A0C0;text-transform:capitalize">${c.ptype || ""}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #1E1E2E;color:#5BB8F6;font-family:monospace;font-weight:700;font-size:16px">${c.callTime || "—"}</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#06060F;font-family:'Helvetica Neue',Arial,sans-serif">
<div style="max-width:680px;margin:0 auto;padding:32px 16px">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#0D0D20,#1A1A2E);border:1px solid #1E1E3E;border-radius:14px;padding:32px;margin-bottom:20px;text-align:center">
    <div style="font-size:10px;letter-spacing:0.2em;color:#5BB8F6;text-transform:uppercase;margin-bottom:12px;font-weight:700">${projectTitle || "Production"} · Call Sheet</div>
    <div style="font-size:38px;font-weight:800;color:#FFFFFF;letter-spacing:-0.03em;margin-bottom:8px">${sheet.date || "Shoot Day"}</div>
    <div style="font-size:14px;color:#7878A0;margin-bottom:20px">General Call: <span style="color:#5BB8F6;font-weight:700;font-size:20px;font-family:monospace">${sheet.generalCall || "TBD"}</span></div>
    ${sheet.location ? `<div style="font-size:13px;color:#A0A0C0">📍 ${sheet.location}</div>` : ""}
  </div>

  <!-- Production Info -->
  <div style="background:#0D0D18;border:1px solid #1E1E2E;border-radius:10px;padding:20px;margin-bottom:16px;display:grid">
    <div style="font-size:9px;letter-spacing:0.15em;color:#5B5B7B;text-transform:uppercase;font-weight:700;margin-bottom:14px">Production Info</div>
    <table style="width:100%;border-collapse:collapse">
      ${sheet.director ? `<tr><td style="padding:5px 0;color:#5B5B7B;font-size:11px;width:40%">Director</td><td style="padding:5px 0;color:#E8E8F8;font-size:13px;font-weight:600">${sheet.director}</td></tr>` : ""}
      ${sheet.dp ? `<tr><td style="padding:5px 0;color:#5B5B7B;font-size:11px">DP / Cinematographer</td><td style="padding:5px 0;color:#E8E8F8;font-size:13px;font-weight:600">${sheet.dp}</td></tr>` : ""}
      ${sheet.weather ? `<tr><td style="padding:5px 0;color:#5B5B7B;font-size:11px">Weather</td><td style="padding:5px 0;color:#E8E8F8;font-size:13px">${sheet.weather}</td></tr>` : ""}
      ${sheet.hospital ? `<tr><td style="padding:5px 0;color:#5B5B7B;font-size:11px">Nearest Hospital</td><td style="padding:5px 0;color:#E8E8F8;font-size:13px">${sheet.hospital}</td></tr>` : ""}
    </table>
  </div>

  ${(sheet.schedule || []).length ? `
  <!-- Schedule -->
  <div style="background:#0D0D18;border:1px solid #1E1E2E;border-radius:10px;padding:20px;margin-bottom:16px">
    <div style="font-size:9px;letter-spacing:0.15em;color:#5B5B7B;text-transform:uppercase;font-weight:700;margin-bottom:14px">Shoot Schedule</div>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#0A0A14">
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Time</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Scene</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Location</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Cast</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Notes</th>
      </tr>
      ${scheduleRows}
    </table>
  </div>` : ""}

  ${(sheet.calls || []).length ? `
  <!-- Call Times -->
  <div style="background:#0D0D18;border:1px solid #1E1E2E;border-radius:10px;padding:20px;margin-bottom:16px">
    <div style="font-size:9px;letter-spacing:0.15em;color:#5B5B7B;text-transform:uppercase;font-weight:700;margin-bottom:14px">Your Call Time</div>
    <table style="width:100%;border-collapse:collapse">
      <tr style="background:#0A0A14">
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Name</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Role</th>
        <th style="padding:8px 12px;text-align:left;font-size:9px;color:#5B5B7B;text-transform:uppercase;letter-spacing:0.08em;font-weight:600">Call Time</th>
      </tr>
      ${callRows}
    </table>
  </div>` : ""}

  ${sheet.notes ? `
  <!-- Notes -->
  <div style="background:#0D0D18;border:1px solid #1E1E2E;border-radius:10px;padding:20px;margin-bottom:16px">
    <div style="font-size:9px;letter-spacing:0.15em;color:#5B5B7B;text-transform:uppercase;font-weight:700;margin-bottom:10px">Notes</div>
    <div style="font-size:13px;color:#A0A0C0;line-height:1.6">${sheet.notes.replace(/\n/g,"<br>")}</div>
  </div>` : ""}

  <!-- Footer -->
  <div style="text-align:center;padding:20px 0;font-size:11px;color:#3A3A5A">Sent via Full Flux · ${projectTitle || "Production"}</div>
</div>
</body>
</html>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: recipients, subject, html }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({ error: data.message || "Resend error" });
    res.json({ ok: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
