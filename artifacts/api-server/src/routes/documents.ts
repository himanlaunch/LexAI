import { Router, type Request, type Response } from "express";

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

function cleanText(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim().slice(0, 4000) : fallback;
}

function getAzureConfig() {
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

function getOpenAIConfig() {
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

router.post("/documents/generate", async (req: Request, res: Response) => {
  const body = req.body as GenerateDocumentBody;
  const documentType = cleanText(body.documentType);

  if (!documentType) {
    return res.status(400).json({ error: "documentType is required" });
  }

  const aiConfig = getAzureConfig() || getOpenAIConfig();

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

    const response = await fetch(aiConfig.url, {
      method: "POST",
      headers: aiConfig.headers,
      body: JSON.stringify({
        model: aiConfig.model,
        messages: buildMessages(normalizedBody),
        temperature: 0.2,
        max_tokens: 2200,
      }),
    });

    const data = (await response.json().catch(() => null)) as
      | { choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }
      | null;

    if (!response.ok) {
      req.log.error(
        {
          route: "/api/documents/generate",
          provider: aiConfig.provider,
          status: response.status,
          error: data?.error?.message,
        },
        "document generation provider failed",
      );

      return res.status(502).json({
        error: "AI provider failed to generate the document",
        details: data?.error?.message || `Provider returned HTTP ${response.status}`,
      });
    }

    const content = data?.choices?.[0]?.message?.content?.trim();

    if (!content) {
      req.log.error({ route: "/api/documents/generate", provider: aiConfig.provider }, "empty AI response");
      return res.status(502).json({ error: "AI provider returned an empty document" });
    }

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
    return res.status(500).json({ error: "Document generation failed unexpectedly" });
  }
});

export default router;
