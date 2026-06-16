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

function cleanLongText(value: unknown) {
  return typeof value === "string" ? value.trim().slice(0, 120_000) : "";
}

function slugifyFilename(value: string, fallback = "agentlamy-document") {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || fallback
  );
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapePdfText(value: string) {
  return value
    .replace(/[^\x09\x0a\x0d\x20-\xff]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function stripLightMarkdown(value: string) {
  return value
    .replace(/^---+$/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function wrapText(value: string, maxChars: number) {
  const wrapped: string[] = [];

  for (const rawLine of value.replace(/\r\n/g, "\n").split("\n")) {
    const line = rawLine.trimEnd();

    if (!line) {
      wrapped.push("");
      continue;
    }

    let current = "";

    for (const word of line.split(/\s+/)) {
      if (!current) {
        current = word;
      } else if (`${current} ${word}`.length <= maxChars) {
        current = `${current} ${word}`;
      } else {
        wrapped.push(current);
        current = word;
      }
    }

    if (current) wrapped.push(current);
  }

  return wrapped;
}

function makeCrcTable() {
  const table = new Uint32Array(256);

  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let j = 0; j < 8; j += 1) {
      crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }

  return table;
}

const crcTable = makeCrcTable();

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime(date = new Date()) {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const dosDate = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: dosDate };
}

function createZip(files: Array<{ name: string; content: string | Buffer }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;
  const timestamp = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.name, "utf8");
    const data = Buffer.isBuffer(file.content) ? file.content : Buffer.from(file.content, "utf8");
    const crc = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(timestamp.time, 10);
    localHeader.writeUInt16LE(timestamp.date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(timestamp.time, 12);
    centralHeader.writeUInt16LE(timestamp.date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    centralParts.push(centralHeader, name);
    offset += localHeader.length + name.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const localFiles = Buffer.concat(localParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localFiles.length, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([localFiles, centralDirectory, end]);
}

function createDocx(title: string, content: string) {
  const paragraphs = stripLightMarkdown(content)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map(line => line.trimEnd());
  const paragraphXml = paragraphs
    .map(line => {
      if (!line.trim()) return "<w:p/>";
      return `<w:p><w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r></w:p>`;
    })
    .join("");

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:r>
        <w:rPr><w:b/><w:sz w:val="32"/></w:rPr>
        <w:t>${escapeXml(title)}</w:t>
      </w:r>
    </w:p>
    ${paragraphXml}
    <w:sectPr>
      <w:pgSz w:w="12240" w:h="15840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

  return createZip([
    {
      name: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`,
    },
    {
      name: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`,
    },
    {
      name: "word/_rels/document.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
    },
    { name: "word/document.xml", content: documentXml },
    {
      name: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(title)}</dc:title>
  <dc:creator>Agentlamy</dc:creator>
  <cp:lastModifiedBy>Agentlamy</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`,
    },
    {
      name: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Agentlamy</Application>
</Properties>`,
    },
  ]);
}

function createPdf(title: string, content: string) {
  const titleLines = wrapText(title, 72);
  const bodyLines = wrapText(stripLightMarkdown(content), 88);
  const allLines = [...titleLines, "", ...bodyLines];
  const linesPerPage = 48;
  const pages: string[][] = [];

  for (let i = 0; i < allLines.length; i += linesPerPage) {
    pages.push(allLines.slice(i, i + linesPerPage));
  }

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  const pageObjectIds = pages.map((_, index) => 3 + index * 2);
  const fontObjectId = 3 + pages.length * 2;
  objects.push(`<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObjectId = pageObjectIds[index];
    const contentObjectId = pageObjectId + 1;
    const streamLines = pageLines.map(line => `(${escapePdfText(line)}) Tj T*`).join("\n");
    const stream = `BT
/F1 11 Tf
50 760 Td
14 TL
${streamLines}
ET`;
    objects[pageObjectId - 1] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`;
    objects[contentObjectId - 1] = `<< /Length ${Buffer.byteLength(stream, "utf8")} >>
stream
${stream}
endstream`;
  });

  objects[fontObjectId - 1] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  const chunks: string[] = ["%PDF-1.4\n"];
  const offsets: number[] = [0];
  let position = Buffer.byteLength(chunks[0], "utf8");

  objects.forEach((object, index) => {
    offsets.push(position);
    const chunk = `${index + 1} 0 obj\n${object}\nendobj\n`;
    chunks.push(chunk);
    position += Buffer.byteLength(chunk, "utf8");
  });

  const xrefOffset = position;
  const xref = [
    `xref\n0 ${objects.length + 1}\n`,
    "0000000000 65535 f \n",
    ...offsets.slice(1).map(offset => `${offset.toString().padStart(10, "0")} 00000 n \n`),
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`,
  ].join("");
  chunks.push(xref);

  return Buffer.from(chunks.join(""), "utf8");
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

router.post("/documents/export", (req: Request, res: Response) => {
  const format = cleanText(req.body?.format).toLowerCase();
  const title = cleanText(req.body?.title, "Agentlamy Document") || "Agentlamy Document";
  const content = cleanLongText(req.body?.content);

  if (!content) {
    return res.status(400).json({ error: "content is required" });
  }

  if (!["docx", "pdf"].includes(format)) {
    return res.status(400).json({ error: "format must be docx or pdf" });
  }

  try {
    const filename = `${slugifyFilename(title)}.${format}`;
    const file =
      format === "docx"
        ? {
            buffer: createDocx(title, content),
            contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          }
        : {
            buffer: createPdf(title, content),
            contentType: "application/pdf",
          };

    req.log.info({ route: "/api/documents/export", format, bytes: file.buffer.length }, "document export created");
    res.setHeader("Content-Type", file.contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", file.buffer.length.toString());
    return res.send(file.buffer);
  } catch (error) {
    req.log.error(
      { route: "/api/documents/export", format, error: error instanceof Error ? error.message : String(error) },
      "document export failed",
    );
    return res.status(500).json({ error: "Document export failed" });
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
