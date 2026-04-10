const http = require("http");
const { URL } = require("url");

const PORT = Number(process.env.AI_BACKEND_PORT || 8787);
const AI_BACKEND_PROVIDER = String(
  process.env.AI_BACKEND_PROVIDER || "fallback",
).toLowerCase();
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:7b-instruct";

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(JSON.stringify(payload));
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";

    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1_000_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });

    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function createOfflineFallback(prompt) {
  const normalized = String(prompt || "").toLowerCase();

  if (normalized.includes("presupuesto")) {
    return "Con base en tu presupuesto, te conviene revisar categorías variables y automatizar ahorros pequeños.";
  }

  if (normalized.includes("internet") || normalized.includes("actual")) {
    return "Puedo responder con información fresca cuando conectemos este backend a una búsqueda web real.";
  }

  return "Respuesta híbrida lista: este backend ya recibe consultas y está preparado para conectar un modelo o un flujo RAG.";
}

async function generateWithOllama(prompt, maxTokens, temperature) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: {
        temperature,
        num_predict: maxTokens,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return String(payload.response || "").trim();
}

async function buildModelResponse(body) {
  const prompt = String(body.prompt || "");
  const maxTokens = Number(body.maxTokens || 512);
  const temperature = Number(body.temperature ?? 0.7);

  if (AI_BACKEND_PROVIDER === "ollama") {
    try {
      const text = await generateWithOllama(prompt, maxTokens, temperature);
      return {
        text: text || createOfflineFallback(prompt),
        modelId: OLLAMA_MODEL,
        providerId: "ollama-local",
        mode: "online",
        fallbackUsed: false,
      };
    } catch (error) {
      return {
        text: createOfflineFallback(prompt),
        modelId: "backend-fallback",
        providerId: "dumy-ai-backend",
        mode: "online",
        fallbackUsed: true,
        warning:
          error instanceof Error ? error.message : "Unknown error using Ollama",
      };
    }
  }

  return {
    text: createOfflineFallback(prompt),
    modelId: "backend-fallback",
    providerId: "dumy-ai-backend",
    mode: "online",
    fallbackUsed: false,
  };
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(
    req.url || "/",
    `http://${req.headers.host || "localhost"}`,
  );

  if (req.method === "OPTIONS") {
    sendJson(res, 204, {});
    return;
  }

  if (req.method === "GET" && requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      service: "dumy-ai-backend",
      mode: "hybrid",
      provider: AI_BACKEND_PROVIDER,
      model: AI_BACKEND_PROVIDER === "ollama" ? OLLAMA_MODEL : "fallback",
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.method === "POST" && requestUrl.pathname === "/ai/chat") {
    try {
      const rawBody = await collectBody(req);
      const body = rawBody ? JSON.parse(rawBody) : {};

      const modelResponse = await buildModelResponse(body);

      sendJson(res, 200, {
        ...modelResponse,
        requestId: `req_${Date.now()}`,
      });
    } catch (error) {
      sendJson(res, 400, {
        error: error instanceof Error ? error.message : "Invalid request",
      });
    }
    return;
  }

  sendJson(res, 404, {
    error: "Not found",
    path: requestUrl.pathname,
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[dumy-ai-backend] listening on http://0.0.0.0:${PORT}`);
  console.log(
    `[dumy-ai-backend] health check: http://localhost:${PORT}/health`,
  );
});
