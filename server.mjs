import http from 'node:http';
import fs from 'node:fs';

try {
  const envFile = fs.readFileSync(new URL('.env', import.meta.url), 'utf8');
  for (const line of envFile.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
} catch {}

const port = Number(process.env.PORT || 8787);
const openAiKey = process.env.OPENAI_API_KEY;
const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' };
const send = (res, status, payload) => { res.writeHead(status, headers); res.end(JSON.stringify(payload)); };
const readBody = (req) => new Promise((resolve, reject) => { let body = ''; req.on('data', chunk => { body += chunk; if (body.length > 1_000_000) reject(new Error('Payload too large')); }); req.on('end', () => resolve(body)); req.on('error', reject); });

function localReply(message) {
  const text = message.toLowerCase();
  if (text.includes('silverstone') || text.includes('race') || text.includes('calendar')) return 'Silverstone is the historic home of Formula 1. Open the Race Atlas to explore every 2026 round, including dates, lights-out times, circuit history and the defining corners.';
  if (text.includes('team') || text.includes('driver') || text.includes('mclaren') || text.includes('ferrari')) return 'Open The Grid and select a team dossier. Each dossier includes both drivers, their car, the team principal, technical leadership, engineering focus, performance profile and history.';
  if (text.includes('car') || text.includes('halo') || text.includes('aero')) return 'The hero car is an embedded F1-style machine. Hover it to inspect the aero package, then use the team dossiers to compare official 2026 car images and chassis details.';
  return 'I can help with teams, drivers, cars, race locations, circuit history, dates, strategy and the Apex Grid experience. What would you like to clarify?';
}

async function aiReply(message, history = []) {
  if (!openAiKey) return localReply(message);
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${openAiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, instructions: 'You are Apex Grid admin, a concise and friendly Formula 1 website assistant. Answer questions about this site, F1 teams, drivers, cars and race weekends. If a fact may be current, clearly qualify it.', input: [...history.slice(-8), { role: 'user', content: message }] }) });
  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  return data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text || localReply(message);
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, aiConfigured: Boolean(openAiKey), model });
  if (req.method === 'POST' && req.url === '/api/chat') {
    try { const body = JSON.parse(await readBody(req)); if (!body.message?.trim()) return send(res, 400, { error: 'Message is required' }); return send(res, 200, { reply: await aiReply(body.message.trim(), Array.isArray(body.history) ? body.history : []) }); }
    catch (error) { console.error(error); return send(res, 500, { reply: 'The admin connection is temporarily unavailable. Please try again in a moment.', error: error.message }); }
  }
  send(res, 404, { error: 'Not found' });
});

server.listen(port, () => console.log(`Apex Grid API listening on http://localhost:${port}`));