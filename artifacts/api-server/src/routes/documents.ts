import { Router, type Request, type Response } from "express";
import net from "node:net";

const router = Router();

type GenerateDocumentBody = {
  documentType?: string;
  category?: string;
  companyName?: string;
  jurisdiction?: string;
  additionalContext?: string;
};

type ChatMessage = {
  role: "system" | "user";
  content: string;
};

type AiConfig = {
  url: string;
  headers: Record<string, string>;
  model: string;
  provider: string;
};

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 4000) : fallback;
}

function cleanUrl(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 1000) : "";
}

function getAzureConfig(): AiConfig | null {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY;
  const deployment =
    process.env.AZURE_OPENAI_DEPLOYMENT ||
    process.env.AZURE_OPENAI_DEPLOYMENT_NAME ||
    process.env.AZURE_OPENAI_CHAT_DEPLOYMENT;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-10-21";

  if (!endpoint || !apiKey || !deployment) return null;

  return {
    url: `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
    },
    model: deployment,
    provider: "azure-openai",
  };
}

function getOpenAIConfig(): AiConfig | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const baseUrl = process.env.OPENAI_BASE_URL?.replace(/\/+$/, "") || "https://api.openai.com/v1";
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  return {
    url: `${baseUrl}/chat/completions`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    model,
    provider: "openai",
  };
}

function getAiConfig() {
  return getAzureConfig() || getOpenAIConfig();
}

async function callAi(aiConfig: AiConfig, messages: ChatMessage[], maxTokens: number, temperature = 0.2) {
  const response = await fetch(aiConfig.url, {
    method: "POST",
    headers: aiConfig.headers,
    body: JSON.stringify({
      model: aiConfig.model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  const data = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
    | null;

  if (!response.ok) {
    throw new Error(data?.error?.message || `Provider returned HTTP ${response.status}`);
  }

  const content = data?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("AI provider returned an empty response");
  }

  return content;
}

function buildMessages(body: Required<GenerateDocumentBody>): ChatMessage[] {
  return [
    {
      role: "system",
      content:
        "You draft practical startup legal document first drafts. Return a structured, editable draft with placeholders where facts are missing. Include a short non-legal-advice note at the end. Do not invent executed facts, signatures, addresses, or registration numbers.",
    },
    {
      role: "user",
      content: [
        `Document type: ${body.documentType}`,
        `Category: ${body.category}`,
        `Company: ${body.companyName}`,
        `Jurisdiction: ${body.jurisdiction}`,
        `Additional context: ${body.additionalContext || "None provided"}`,
        "",
        "Create a clean first draft with sections, defined terms, signature blocks where appropriate, and a concise checklist of missing details the user should confirm.",
      ].join("\n"),
    },
  ];
}

function normalizeWebsiteUrl(value: unknown) {
  const rawUrl = cleanUrl(value);
  const withProtocol = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
  const url = new URL(withProtocol);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only http and https URLs are supported");
  }

  const hostname = url.hostname.toLowerCase();
  const ipVersion = net.isIP(hostname);

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname) ||
    (ipVersion === 6 && (hostname.startsWith("fc") || hostname.startsWith("fd") || hostname.startsWith("fe80")))
  ) {
    throw new Error("Private or local URLs are not supported");
  }

  url.hash = "";
  return url.toString();
}

function extractMeta(html: string, name: string) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta[^>]+(?:name|property)=["']${escapedName}["'][^>]+content=["']([^"']+)["'][^>]*>|<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["']${escapedName}["'][^>]*>`,
    "i",
  );
  const match = html.match(pattern);
  return (match?.[1] || match?.[2] || "").replace(/\s+/g, " ").trim();
}

function htmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18000);
}

function parseJsonObject(value: string) {
  const trimmed = value.trim();
  const jsonText = trimmed.startsWith("{") ? trimmed : trimmed.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    throw new Error("AI did not return structured website research");
  }

  return JSON.parse(jsonText) as {
    companyName?: string;
    jurisdiction?: string;
    summary?: string;
    discoveredFacts?: string[];
    legalContext?: string;
  };
}

async function fetchWebsitePage(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "text/html,application/xhtml+xml,text/plain;q=0.9,*/*;q=0.5",
      "User-Agent": "AgentlamyDocumentResearch/1.0",
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) {
    throw new Error(`Website returned HTTP ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const rawText = (await response.text()).slice(0, 250_000);
  const title = rawText.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "";
  const description = extractMeta(rawText, "description") || extractMeta(rawText, "og:description");
  const text = contentType.includes("html") ? htmlToText(rawText) : rawText.replace(/\s+/g, " ").trim().slice(0, 18000);

  return { title, description, text };
}

async function fetchWebsiteContext(url: string) {
  const baseUrl = new URL(url);
  const pages = [url];

  for (const path of ["/about", "/company", "/contact", "/privacy", "/terms"]) {
    const nextUrl = new URL(path, baseUrl);
    if (!pages.includes(nextUrl.toString())) pages.push(nextUrl.toString());
  }

  const fetchedPages = [];

  for (const pageUrl of pages) {
    try {
      const page = await fetchWebsitePage(pageUrl);
      fetchedPages.push({ ...page, url: pageUrl });
      if (fetchedPages.map(item => item.text).join(" ").length > 6000) break;
    } catch {
      // Some common pages will not exist. Keep the research best-effort.
    }
  }

  if (!fetchedPages.length) {
    throw new Error("The website could not be fetched");
  }

  const title = fetchedPages.find(page => page.title)?.title || baseUrl.hostname;
  const description = fetchedPages.find(page => page.description)?.description || "";
  const combinedText = fetchedPages
    .map(page => [`URL: ${page.url}`, page.title ? `Title: ${page.title}` : "", page.description ? `Description: ${page.description}` : "", page.text].filter(Boolean).join("\n"))
    .join("\n\n---\n\n")
    .slice(0, 18000);
  const text =
    combinedText.length >= 80
      ? combinedText
      : [`Website: ${baseUrl.hostname}`, title ? `Title: ${title}` : "", description ? `Description: ${description}` : ""]
          .filter(Boolean)
          .join("\n");

  return { title, description, text };
}

router.post("/documents/research-url", async (req: Request, res: Response) => {
  const sourceUrl = cleanUrl(req.body?.url);
  const documentType = cleanText(req.body?.documentType, "Startup legal document");
  const category = cleanText(req.body?.category, "Startup legal document");

  if (!sourceUrl) {
    return res.status(400).json({ error: "url is required" });
  }

  const aiConfig = getAiConfig();

  if (!aiConfig) {
    req.log.warn({ route: "/api/documents/research-url" }, "website research missing AI environment variables");
    return res.status(503).json({
      error: "Website research is not configured",
      details:
        "Add AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT, or add OPENAI_API_KEY to this Vercel project production environment.",
    });
  }

  const startedAt = Date.now();

  try {
    const normalizedUrl = normalizeWebsiteUrl(sourceUrl);
    const website = await fetchWebsiteContext(normalizedUrl);

    req.log.info(
      { route: "/api/documents/research-url", provider: aiConfig.provider, sourceHost: new URL(normalizedUrl).hostname },
      "website research started",
    );

    const content = await callAi(
      aiConfig,
      [
        {
          role: "system",
          content:
            "Extract startup/company facts from website text for drafting legal documents. Return only valid JSON with keys: companyName, jurisdiction, summary, discoveredFacts, legalContext. Use empty strings or empty arrays when unknown. Do not invent facts.",
        },
        {
          role: "user",
          content: [
            `Source URL: ${normalizedUrl}`,
            `Page title: ${website.title || "Unknown"}`,
            `Meta description: ${website.description || "Unknown"}`,
            `Target document type: ${documentType}`,
            `Target category: ${category}`,
            "",
            "Website text:",
            website.text,
          ].join("\n"),
        },
      ],
      1200,
      0.1,
    );

    const parsed = parseJsonObject(content);
    const discoveredFacts = Array.isArray(parsed.discoveredFacts)
      ? parsed.discoveredFacts.map(fact => cleanText(fact)).filter(Boolean).slice(0, 10)
      : [];
    const companyName = cleanText(parsed.companyName);
    const jurisdiction = cleanText(parsed.jurisdiction, "Delaware, United States") || "Delaware, United States";
    const summary = cleanText(parsed.summary);
    const legalContext = cleanText(parsed.legalContext);
    const additionalContext = [
      `Source URL: ${normalizedUrl}`,
      website.title ? `Website title: ${website.title}` : "",
      summary ? `Business summary: ${summary}` : "",
      legalContext ? `Legal drafting context: ${legalContext}` : "",
      discoveredFacts.length ? `Discovered facts:\n${discoveredFacts.map(fact => `- ${fact}`).join("\n")}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    req.log.info(
      {
        route: "/api/documents/research-url",
        provider: aiConfig.provider,
        durationMs: Date.now() - startedAt,
      },
      "website research completed",
    );

    return res.json({
      sourceUrl: normalizedUrl,
      provider: aiConfig.provider,
      companyName,
      jurisdiction,
      summary,
      discoveredFacts,
      additionalContext,
    });
  } catch (error) {
    req.log.error(
      { route: "/api/documents/research-url", error: error instanceof Error ? error.message : String(error) },
      "website research failed",
    );
    return res.status(502).json({
      error: "Website research failed",
      details: error instanceof Error ? error.message : "Unable to research this website",
    });
  }
});

router.post("/documents/generate", async (req: Request, res: Response) => {
  const body = req.body as GenerateDocumentBody;
  const documentType = cleanText(body.documentType);

  if (!documentType) {
    return res.status(400).json({ error: "documentType is required" });
  }

  const aiConfig = getAiConfig();

  if (!aiConfig) {
    req.log.warn({ route: "/api/documents/generate" }, "document generation missing AI environment variables");
    return res.status(503).json({
      error: "Document generation is not configured",
      details:
        "Add AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT, or add OPENAI_API_KEY to this Vercel project production environment.",
    });
  }

  const normalizedBody: Required<GenerateDocumentBody> = {
    documentType,
    category: cleanText(body.category, "Startup legal document"),
    companyName: cleanText(body.companyName, "[Company Name]") || "[Company Name]",
    jurisdiction: cleanText(body.jurisdiction, "Delaware, United States") || "Delaware, United States",
    additionalContext: cleanText(body.additionalContext),
  };

  const startedAt = Date.now();

  try {
    req.log.info(
      { route: "/api/documents/generate", provider: aiConfig.provider, documentType },
      "document generation started",
    );

    const content = await callAi(aiConfig, buildMessages(normalizedBody), 2200);

    req.log.info(
      {
        route: "/api/documents/generate",
        provider: aiConfig.provider,
        durationMs: Date.now() - startedAt,
      },
      "document generation completed",
    );

    return res.json({
      documentType,
      category: normalizedBody.category,
      provider: aiConfig.provider,
      content,
    });
  } catch (error) {
    req.log.error(
      { route: "/api/documents/generate", error: error instanceof Error ? error.message : String(error) },
      "document generation crashed",
    );
    return res.status(502).json({
      error: "Document generation failed",
      details: error instanceof Error ? error.message : "Document generation failed unexpectedly",
    });
  }
});

export default router;
