import { Router, type IRouter } from "express";
import { z } from "zod";

const router: IRouter = Router();

const ScanRequest = z.object({
  url: z.string().url(),
  area: z.string().optional().default(""),
  focus: z.string().optional().default(""),
  competitors: z.array(z.string().url()).optional().default([]),
});

function scoreFromSignals(signals: boolean[]) {
  const active = signals.filter(Boolean).length;
  return Math.round((active / Math.max(signals.length, 1)) * 100);
}

function textIncludesAny(text: string, values: string[]) {
  const haystack = text.toLowerCase();
  return values.some((value) => value && haystack.includes(value.toLowerCase()));
}

async function fetchText(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "artifactengineer-AEO-Scanner/1.0",
      },
    });

    if (!response.ok) {
      return "";
    }

    return await response.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function extractTitle(html: string) {
  return html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || "Untitled page";
}

function extractDescription(html: string) {
  return (
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim() ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i)?.[1]?.trim() ||
    "No meta description found."
  );
}

router.post("/imported-web/public-scan", async (req, res) => {
  const parsed = ScanRequest.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ ok: false, error: "Enter a valid URL before scanning." });
    return;
  }

  const { url, area, focus, competitors } = parsed.data;
  const target = new URL(url);
  const root = target.origin;
  const [html, robots, llms] = await Promise.all([
    fetchText(url),
    fetchText(`${root}/robots.txt`),
    fetchText(`${root}/llms.txt`),
  ]);

  const plainText = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const focusTerms = focus.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
  const discoveryScore = scoreFromSignals([Boolean(html), Boolean(robots), Boolean(llms), /<title/i.test(html), /name=["']description["']/i.test(html)]);
  const agentScore = scoreFromSignals([
    /llms\.txt/i.test(html + robots + llms),
    /\b(api|docs|documentation|guide|support)\b/i.test(plainText),
    /\b(contact|demo|book|schedule|sales)\b/i.test(plainText),
    /\bpricing|plans|quote|estimate|cost\b/i.test(plainText),
  ]);
  const marketScore = scoreFromSignals([
    Boolean(area && textIncludesAny(plainText, [area])),
    Boolean(focusTerms.length && textIncludesAny(plainText, focusTerms)),
    competitors.length > 0,
    plainText.length > 1200,
  ]);
  const overallScore = Math.round((discoveryScore + agentScore + marketScore) / 3);

  res.json({
    ok: true,
    result: {
      url,
      host: target.hostname.replace(/^www\./, ""),
      title: extractTitle(html),
      description: extractDescription(html),
      scores: {
        overall: overallScore,
        discovery: discoveryScore,
        agent: agentScore,
        market: marketScore,
      },
      signals: [
        { label: "Robots.txt", ok: Boolean(robots), detail: robots ? "Crawl rules are available." : "No robots.txt was found." },
        { label: "llms.txt", ok: Boolean(llms), detail: llms ? "AI-readable guidance is available." : "No llms.txt was found." },
        { label: "Agent path", ok: /\b(contact|demo|book|schedule|sales)\b/i.test(plainText), detail: "Checks for a direct conversion path." },
        { label: "Market context", ok: marketScore >= 50, detail: "Checks whether area, focus, and competitor context can ground answers." },
      ],
    },
  });
});

export default router;
