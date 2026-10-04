const http = require('node:http');
const { seed } = require('./seed');

const PORT = 3001;
let messages = seed.map(message => ({ ...message }));

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function aiReply() {
  return {
    id: `ai-${Date.now()}`,
    type: 'ai',
    text: 'Saturn still favors steady effort. Here is one more step you can take.',
    createdAt: new Date().toISOString(),
    status: 'sent',
    recommendations: [
      {
        id: `rec-${Date.now()}`,
        type: 'tarot',
        title: 'Career Tarot Reading',
        subtitle: 'A focused three-card spread',
      },
    ],
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/conversation') {
      await wait(600);
      if (url.searchParams.get('fail') === '1') {
        send(res, 500, { error: 'Unable to load conversation.' });
        return;
      }
      send(res, 200, messages);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/messages') {
      const body = await readBody(req);
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const clientId = typeof body.clientId === 'string' ? body.clientId : '';
      if (!text || !clientId) {
        send(res, 400, { error: 'text and clientId are required' });
        return;
      }
      await wait(900);
      if (text.toLowerCase() === 'fail') {
        send(res, 500, { error: 'Send failed' });
        return;
      }
      const userMessage = {
        id: clientId,
        type: 'user',
        text,
        createdAt: new Date().toISOString(),
        status: 'sent',
        replyToId: body.replyToId ?? null,
      };
      const aiMessage = aiReply();
      messages = messages.concat(userMessage, aiMessage);
      send(res, 200, { userMessage, aiMessage });
      return;
    }

    send(res, 404, { error: 'Not found' });
  } catch {
    send(res, 400, { error: 'Bad request' });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`conversation api on ${PORT}`);
});
