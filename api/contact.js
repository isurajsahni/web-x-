// Vercel serverless function — POST /api/contact
// Delivers contact-form leads to hello@thewebx.in via Resend.
//
// Setup (one-time):
//   1. Sign up at https://resend.com (free tier: 3k emails/month, no card).
//   2. Verify thewebx.in as a sending domain — Resend gives you 3 DNS records
//      to add at your DNS host. After verification, mail can be sent from
//      hello@thewebx.in instead of onboarding@resend.dev.
//   3. Create an API key at resend.com/api-keys.
//   4. Vercel Dashboard → your project → Settings → Environment Variables →
//      add RESEND_API_KEY = re_xxxxxxxxxxxx (mark all 3 envs).
//      Optional: LEAD_TO = hello@thewebx.in   (defaults to this anyway).
//      Optional: LEAD_FROM = "Web{X} site <hello@thewebx.in>" (defaults to
//      onboarding@resend.dev until your domain is verified).
//   5. Redeploy. Form starts delivering instantly.

const RESEND_URL = 'https://api.resend.com/emails';

function esc(s) { return String(s == null ? '' : s).replace(/[<>&]/g, function (c) { return c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'; }); }

async function parseBody(req) {
  // Vercel may have parsed JSON already; otherwise read multipart or form-encoded.
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  const ct = (req.headers['content-type'] || '').toLowerCase();
  if (ct.indexOf('application/json') === 0) { try { return JSON.parse(raw); } catch (_) { return {}; } }
  if (ct.indexOf('application/x-www-form-urlencoded') === 0) {
    const out = {};
    new URLSearchParams(raw).forEach(function (v, k) { out[k] = v; });
    return out;
  }
  // multipart/form-data — a tiny hand-rolled parser is enough for 3 plain text fields
  const m = ct.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
  if (!m) return {};
  const boundary = '--' + (m[1] || m[2]).trim();
  const out = {};
  raw.split(boundary).forEach(function (part) {
    const nameMatch = part.match(/name="([^"]+)"/);
    if (!nameMatch) return;
    const idx = part.indexOf('\r\n\r\n');
    if (idx === -1) return;
    out[nameMatch[1]] = part.slice(idx + 4).replace(/\r\n--$|\r\n$/, '');
  });
  return out;
}

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') { res.setHeader('Allow', 'POST'); return res.status(204).end(); }
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method' }); }

  let body;
  try { body = await parseBody(req); } catch (_) { return res.status(400).json({ ok: false, error: 'parse' }); }

  const name = (body.name || '').trim();
  const email = (body.email || '').trim();
  const message = (body.message || '').trim();
  const company = (body.company || '').trim();   // honeypot — must be empty

  // Validation matches the front-end so messages reach the inbox in the same
  // shape that already passed the client check.
  if (company) return res.status(200).json({ ok: true });   // silently drop bots
  if (!name) return res.status(400).json({ ok: false, error: 'name' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ ok: false, error: 'email' });
  if (message.length < 10) return res.status(400).json({ ok: false, error: 'message' });

  const key = process.env.RESEND_API_KEY;
  if (!key) return res.status(500).json({ ok: false, error: 'env' });

  const to = process.env.LEAD_TO || 'hello@thewebx.in';
  // Until the domain is verified in Resend, FROM has to be onboarding@resend.dev.
  // After verification, switch this env to e.g. "Web{X} site <hello@thewebx.in>".
  const from = process.env.LEAD_FROM || 'Web{X} site <onboarding@resend.dev>';

  const subject = 'New lead — ' + name + (message.length > 60 ? ' — ' + message.slice(0, 60) + '…' : '');
  const text =
    'Name: ' + name + '\n' +
    'Email: ' + email + '\n' +
    'IP: ' + (req.headers['x-forwarded-for'] || '') + '\n' +
    'Page: ' + (req.headers['referer'] || '') + '\n\n' +
    'Message:\n' + message + '\n';
  const html =
    '<table style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;font-size:15px;line-height:1.55;color:#0b0b12">' +
    '<tr><td style="padding:4px 10px 4px 0;color:#6b6b78">Name</td><td>' + esc(name) + '</td></tr>' +
    '<tr><td style="padding:4px 10px 4px 0;color:#6b6b78">Email</td><td><a href="mailto:' + esc(email) + '">' + esc(email) + '</a></td></tr>' +
    '<tr><td style="padding:4px 10px 4px 0;color:#6b6b78;vertical-align:top">Message</td><td style="white-space:pre-wrap">' + esc(message) + '</td></tr>' +
    '</table>';

  try {
    const r = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from, to: [to], reply_to: email, subject: subject, text: text, html: html }),
    });
    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ ok: false, error: 'resend', detail: detail.slice(0, 400) });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(502).json({ ok: false, error: 'network', detail: String(err).slice(0, 400) });
  }
};
