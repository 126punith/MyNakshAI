const http = require('node:http');
const { seed } = require('./data');
const { matchIntent, withBirthMonth } = require('./fuzzy');

const PORT = 3001;
let messages = seed.map(message => ({ ...message }));

function send(req, res, status, body, detail) {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const extra = detail ? ` ${detail}` : '';
  console.log(`${req.method} ${url.pathname} ${status}${extra}`);
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

const planCard = {
  type: 'promotion',
  title: 'First consultation offer',
  subtitle: 'Valid this week',
};

function askForBirthDate(stamp, createdAt, match) {
  return {
    messages: [
      {
        id: `ai-${stamp}`,
        type: 'ai',
        text: 'What is your date of birth?',
        createdAt,
        status: 'sent',
      },
    ],
    match,
  };
}

function aiReply(text, birthDate, topic) {
  const intent = matchIntent(birthDate && topic ? topic : text);
  const stamp = Date.now();
  const createdAt = new Date().toISOString();
  if (!intent.recommendation) {
    return {
      messages: [
        {
          id: `ai-${stamp}`,
          type: 'ai',
          text: intent.text,
          createdAt,
          status: 'sent',
        },
      ],
      match: intent.id,
    };
  }
  if (!birthDate) {
    return askForBirthDate(stamp, createdAt, intent.id);
  }
  return {
    messages: [
      {
        id: `ai-${stamp}-1`,
        type: 'ai',
        text: withBirthMonth(intent.text, birthDate),
        createdAt,
        status: 'sent',
        recommendations: [
          {
            id: `rec-${stamp}`,
            ...intent.recommendation,
          },
        ],
      },
      {
        id: `ai-${stamp}-2`,
        type: 'ai',
        text: 'Please buy the plan.',
        createdAt,
        status: 'sent',
        recommendations: [
          {
            id: `rec-${stamp}-plan`,
            ...planCard,
          },
        ],
      },
    ],
    match: intent.id,
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  try {
    if (req.method === 'GET' && url.pathname === '/conversation') {
      await wait(1200);
      if (url.searchParams.get('fail') === '1') {
        send(req, res, 500, { error: 'Unable to load conversation.' }, 'fail=1');
        return;
      }
      send(req, res, 200, messages, `count=${messages.length}`);
      return;
    }

    if (req.method === 'POST' && url.pathname === '/messages') {
      const body = await readBody(req);
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      const clientId = typeof body.clientId === 'string' ? body.clientId : '';
      if (!text || !clientId) {
        const reason = clientId ? 'missing text' : 'missing clientId';
        send(req, res, 400, { error: 'text and clientId are required' }, reason);
        return;
      }
      await wait(1600);
      if (text.toLowerCase() === 'fail') {
        send(
          req,
          res,
          500,
          { error: 'Send failed' },
          `clientId=${clientId} text=${JSON.stringify(text)}`,
        );
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
      const birthDate = typeof body.birthDate === 'string' ? body.birthDate : '';
      const topic = typeof body.topic === 'string' ? body.topic : '';
      const reply = aiReply(text, birthDate, topic);
      const aiMessages = reply.messages;
      const aiMessage = aiMessages[0];
      messages = messages.concat(userMessage, aiMessages);
      send(
        req,
        res,
        200,
        { userMessage, aiMessage, aiMessages },
        `clientId=${clientId} replyToId=${body.replyToId ?? null} text=${JSON.stringify(text)} birthDate=${birthDate || 'none'} topic=${topic || 'none'} ai=${aiMessages.map(message => message.id).join(',')} match=${reply.match}`,
      );
      return;
    }

    send(req, res, 404, { error: 'Not found' });
  } catch {
    send(req, res, 400, { error: 'Bad request' }, 'bad JSON');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`conversation api on ${PORT}`);
});
