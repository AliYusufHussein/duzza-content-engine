import type { Brief, Extraction } from "./campaign-types";

function frameworkStructure(fw: string, b: Brief): string {
  switch (fw) {
    case "Step-by-step":
      return `STEP-BY-STEP STRUCTURE — REQUIRED
- Write the article as a numbered sequence of steps (MINIMUM 5).
- For each step: a clear title, a 2–4 sentence explanation, and ONE common mistake readers make at that step.
- Include a dedicated "Tools & Resources" section listing tools/resources used.
- Cover ${b.solution} broken down across these steps.`;
    case "Loop / cycle":
      return `LOOP / CYCLE STRUCTURE — REQUIRED
- Frame the article as a named loop/cycle with named phases (3–5) that connect back to the start.
- Identify the TRIGGER that begins the loop.
- For each phase: a name, what happens, and the concrete OUTPUT of that phase.
- Show how the final phase feeds the trigger again.
- The loop should solve: ${b.problem} via ${b.solution}.`;
    case "Matrix / scoring":
      return `MATRIX / SCORING STRUCTURE — REQUIRED
- Build a named matrix with named CRITERIA (3–5).
- Define a clear scoring or evaluation mechanism (e.g. 1–5 per criterion).
- Define RESULT TIERS that scores map to with what each tier means.
- Apply the matrix to ${b.solution} so the reader can self-evaluate.`;
    case "Before / after":
      return `BEFORE / AFTER STRUCTURE — REQUIRED
- BEFORE state: vividly describe the starting condition tied to ${b.problem}.
- TURNING POINT: the specific moment / decision / insight that changed things.
- AFTER state: the resulting state with MEASURABLE proof (numbers, outcomes).
- REPLICATION: a clear section showing how the reader can replicate the transformation.`;
    case "3-Pillar system":
    default:
      return `3-PILLAR STRUCTURE — REQUIRED
- Introduce exactly 3 named PILLARS that together form "${b.solution}".
- For each pillar: a name, a 2–4 sentence explanation, and ONE concrete action step.
- Include a CASE STUDY showing measurable outcome from applying the 3 pillars.`;
  }
}

function toneBlock(b: Brief): string {
  if (!b.toneProfile && !b.channel && !b.content_goal) return "";
  const tp = b.toneProfile || {};
  const keywords = Array.isArray(tp.tone_keywords) ? tp.tone_keywords.join(", ") : "";
  return `CHANNEL TONE PROFILE:
Brand: ${b.channel || ""}
Voice: ${tp.brand_voice || ""}
Tone: ${keywords}
Audience: ${tp.audience || b.audience || ""}
Avoid: ${tp.avoid || ""}
Sample line: ${tp.sample_line || ""}
Content Goal: ${b.content_goal || ""}

Write the entire article in this voice. Do not break character.

`;
}

export function buildBlogPrompt(b: Brief): string {
  const extras = b.extras.length ? `\nALSO GENERATE:\n${b.extras.map(e => `- ${e}`).join("\n")}` : "";
  const tone = toneBlock(b);
  const fwBlock = frameworkStructure(b.fwstyle, b);
  return `${tone}You are an expert blog writer and SEO strategist.

CONTENT BRIEF
Topic: ${b.topic}
Target audience: ${b.audience}
Industry/niche: ${b.niche}
Core problem: ${b.problem}
Main solution/angle: ${b.solution}
Hook statistic: ${b.stat}
Authority signal: ${b.authority}
Primary SEO keyword: "${b.kw1}"
Secondary keywords: ${b.kw2}
URL slug: ${b.slug}
Tone: ${b.tone}
Format: ${b.format}
Framework: ${b.fwstyle}
Content goal: ${b.content_goal || "(unspecified)"}
Word count: ${b.wordcount}
${b.context ? `Additional context: ${b.context}` : ""}

Before writing, state:
- PRIMARY KEYWORD: [confirm]
- SECONDARY KEYWORDS: [confirm 2–3]
- META DESCRIPTION: [150–160 characters, includes primary keyword]
- URL SLUG: [short, keyword-rich, lowercase with hyphens]

Then write a complete, publish-ready ${b.wordcount} word ${b.format} satisfying every requirement below.

══════════════════════════════════════
ARTICLE STRUCTURE
══════════════════════════════════════

1. HEADLINE — Specific, benefit-driven, contains primary keyword. Write 3 options + recommend strongest.
2. OPENING HOOK (2–4 sentences) — Start with: ${b.stat}. Make reader feel understood.
3. TL;DR — 3 bold sentences summarising core value.
4. BRIEF INTRO (2–3 sentences) — Primary keyword appears naturally.

${fwBlock}

5. FAQ (3–5 Q&A addressing objections).
6. KEY TAKEAWAYS (bulleted recap).
7. CTA — One and only one clear call to action.

Visual placements you should reference where natural:
- Problem image: ${b.img1}
- Framework diagram: ${b.img2}
- Pillars / phases infographic: ${b.img3}
- Action screenshot: ${b.img4}
- Result visual: ${b.img6}

══════════════════════════════════════
AFTER THE ARTICLE — COMPLETION REPORT
══════════════════════════════════════
PRIMARY KEYWORD / SECONDARY KEYWORDS / META DESCRIPTION / URL SLUG / CHECKLIST SIGN-OFF.${extras}`;
}

export function frameworkExtractionKeys(fw: string): string[] {
  switch (fw) {
    case "Step-by-step":
      return [
        "headline", "hook", "tldr",
        "step_1_title", "step_1_desc", "step_1_mistake",
        "step_2_title", "step_2_desc", "step_2_mistake",
        "step_3_title", "step_3_desc", "step_3_mistake",
        "step_4_title", "step_4_desc", "step_4_mistake",
        "step_5_title", "step_5_desc", "step_5_mistake",
        "tools_section", "cta", "primary_keyword",
      ];
    case "Loop / cycle":
      return [
        "headline", "hook", "tldr", "loop_name", "trigger",
        "phase_1_name", "phase_1_output",
        "phase_2_name", "phase_2_output",
        "phase_3_name", "phase_3_output",
        "phase_4_name", "phase_4_output",
        "cta", "primary_keyword",
      ];
    case "Matrix / scoring":
      return [
        "headline", "hook", "tldr", "matrix_name",
        "criterion_1", "criterion_2", "criterion_3", "criterion_4",
        "scoring_mechanism", "result_tiers",
        "cta", "primary_keyword",
      ];
    case "Before / after":
      return [
        "headline", "hook", "tldr",
        "before_state", "turning_point", "after_state", "measurable_proof", "replication_steps",
        "cta", "primary_keyword",
      ];
    case "3-Pillar system":
    default:
      return [
        "headline", "hook", "tldr", "framework_name",
        "pillar_1", "pillar_2", "pillar_3",
        "action_step_1", "action_step_2", "action_step_3",
        "case_study_industry", "case_study_outcome",
        "faq_1", "faq_2",
        "cta", "primary_keyword", "hook_stat",
      ];
  }
}

export function buildExtractionPrompt(article: string, framework = "3-Pillar system"): string {
  const keys = frameworkExtractionKeys(framework);
  const shape = "{\n" + keys.map(k => `  "${k}": ""`).join(",\n") + "\n}";
  return `You are a content extraction engine. The article below was written using the "${framework}" framework. Extract the elements specific to that framework.

Return ONLY a valid JSON object with no markdown, no preamble, no explanation. Use these exact keys:

${shape}

If any element is not clearly present, use an empty string "".

ARTICLE:
${article}`;
}

function ex(extraction: Extraction, k: string, fallback = ""): string {
  const v = extraction?.[k];
  return (typeof v === "string" ? v : "") || fallback;
}

function sharedBrief(b: Brief, e: Extraction): string {
  return `CONTENT BRIEF
Topic: ${b.topic}
Audience: ${b.audience}
Framework: ${ex(e, "framework_name", b.solution)}
Hook stat: ${ex(e, "hook_stat", b.stat)}
Primary keyword: ${ex(e, "primary_keyword", b.kw1)}
Case study: ${ex(e, "case_study_industry")} — ${ex(e, "case_study_outcome")}
CTA goal: ${b.cta_chips.join(", ")}
Distribution: ${b.sequencing}
Primary goal: ${b.goal}`;
}

export function buildPlatformPrompt(platform: string, sub: string, b: Brief, e: Extraction): string {
  const sb = sharedBrief(b, e);
  const fw = ex(e, "framework_name", "the framework");
  const p1 = ex(e, "pillar_1"), p2 = ex(e, "pillar_2"), p3 = ex(e, "pillar_3");
  const cs = `${ex(e, "case_study_industry")} → ${ex(e, "case_study_outcome")}`;

  switch (platform) {
    case "twitter":
      return `You are an expert X/Twitter content strategist.

${sb}

Write a complete X/Twitter ${sub === "Thread" ? "thread (10–14 tweets)" : "single tweet (max 280 chars)"} based on this article.

REQUIRED STRUCTURE:
- Tweet 1 (Title): Sharp curiosity claim under 200 chars. Uses: "${ex(e, "hook_stat")}"
- Tweet 2 (Opening): Expand the angle
- Tweet 3 (Context): Broader shift or misconception
- Tweet 4 (Problem): What most people get wrong
- Tweet 5 (Framework): Introduce "${fw}"
- Tweets 6–10 (Breakdown): One idea per tweet using ${p1}, ${p2}, ${p3}
- Tweet 11 (Example): ${cs}
- Tweet 12 (Mistakes): 2–3 common errors
- Tweet 13 (Takeaway): Big lesson in one line
- Tweet 14 (CTA): One clear action + link

WRITING RULES: One core idea per tweet · Short clean lines · No filler · Format "1/" numbering.

ALSO GENERATE: 3 title tweet options · 2 CTA options · 5 hook variations.`;

    case "linkedin":
      return `You are an expert LinkedIn content strategist.

${sb}

Write a LinkedIn ${sub === "Article" ? "long-form article (1,200–1,800 words)" : "short post (max 1,300 chars)"} based on this article.

REQUIRED STRUCTURE:
- Opening line: scroll-stopping (NOT "I'm excited to share")
- Context: professional/business framing
- Core problem: what people misunderstand
- Key insight
- Named framework: "${fw}" — using ${p1}, ${p2}, ${p3}
- Real-world: ${cs}
- Takeaway
- CTA: one step only

WRITING RULES: Short paragraphs · Sharp credible tone · Insight over inspiration · 4–6 hashtags.

ALSO GENERATE: 3 opening line options · 2 CTA options · 5 hook variations.`;

    case "tiktok":
      return `You are an expert short-form video scriptwriter.

${sb}

Write a TikTok/Reels script (${sub === "Educational" ? "45–60s educational" : sub === "POV story" ? "30–45s POV" : "15–30s trending hook"}) based on this article.

SCRIPT STRUCTURE:
HOOK (0–3s): Reference "${ex(e, "hook_stat", b.stat)}"
PROBLEM (3–10s): Frame ${b.problem}
SOLUTION (10–40s): Reference "${fw}", cover ${p1}, ${p2}, ${p3}
RESULT (40–52s): Payoff — ${ex(e, "case_study_outcome")}
CTA (last 3s): Single clear action

ALSO PROVIDE: On-screen text overlays · 6–8 hashtags · Trending audio vibe · 2 alternative hooks.`;

    case "email":
      if (sub === "Drip sequence") {
        return `You are an expert email copywriter.

${sb}

Write a 3-email drip sequence based on this article.

EMAIL 1 (Day 0 — Hook/Problem): 2 subject options · open with ${b.problem} · tease solution · CTA: read article.
EMAIL 2 (Day 2 — Framework): 2 subject options · deliver "${fw}" · mini case study: ${ex(e, "case_study_industry")} · CTA: apply today.
EMAIL 3 (Day 5 — Proof/Close): 2 subject options · ${ex(e, "case_study_outcome")} as proof · address ${ex(e, "faq_1")} · final CTA.

Use [First Name] placeholder. 2–3 sentence paragraphs. No "Hope this finds you well."`;
      }
      return `You are an expert email copywriter.

${sb}

Write an email newsletter (600–900 words) based on this article.

NEWSLETTER STRUCTURE:
- 3 subject line options (curiosity / benefit / personal)
- Preview text
- Opening: address reader's pain point
- Body: deliver "${fw}" — reference blog as full breakdown
- Concrete example: ${cs}
- Key takeaway
- CTA: ${b.cta_chips.join(", ")}
- Conversational sign-off

Rules: [First Name] placeholder · short paragraphs · clear beats clever.`;

    case "reddit":
      return `You are an expert Reddit content strategist.

${sb}

Write a Reddit ${sub === "Discussion" ? "discussion starter (400–600 words)" : "data analysis post (800–1,200 words)"}.

REQUIRED STRUCTURE:
- 3 title options — specific, data-driven, not clickbait
- First-person community voice (NOT brand)
- Lead with surprising stat: "${ex(e, "hook_stat")}"
- Structure: context → data → "${fw}" → open question
- Acknowledge limitations and counterpoints
- End with genuine community question
- Mention blog as "I wrote the full breakdown here"

WRITING RULES: Reddit markdown · peer not authority · intellectual honesty.`;

    case "instagram":
      return `You are an expert Instagram content strategist.

${sb}

Write an Instagram ${sub === "Reels" ? "Reels script (15–30s) + caption" : sub === "Carousel" ? "carousel (6–8 slides) + caption" : "single post caption (150–250 words)"}.

${sub === "Reels"
  ? `SCRIPT: Hook references "${ex(e, "hook_stat")}" · 3 rapid points: ${p1}, ${p2}, ${p3} · CTA: "Save this".\nCAPTION: 150–200 words + 10–15 hashtags.`
  : sub === "Carousel"
  ? `SLIDES: 1 Hook · 2–4 insights from pillars · 5 Example: ${ex(e, "case_study_industry")} · 6 Mistakes · 7 Summary · 8 CTA.\nCAPTION: hook line under 125 chars · 10–15 hashtags.`
  : `CAPTION: hook line · context · core message · 3 lessons · ${ex(e, "case_study_industry")} example · takeaway · CTA · 10–15 hashtags.`}

WRITING RULES: Mobile reading · easy to save · deepen the visual.`;

    case "telegram":
      return `You are an expert Telegram channel writer.

${sb}

Write a Telegram channel post (${sub === "Discussion" ? "200–400 words discussion" : "300–500 words exclusive insight"}).

REQUIRED STRUCTURE:
- Opening line: immediate relevance
- Topic setup
- Main value: 2–4 short lessons using "${fw}"
- Practical takeaway
- Closing line
- CTA: one action only

${sub === "Discussion" ? `Frame as question/debate. Use ${ex(e, "case_study_outcome")} as proof, then ask for theirs.` : `Lead with exclusive insight. Reference blog as full breakdown.`}

WRITING RULES: Small screens · short paragraphs · **Bold** sparingly · end with poll/question.

ALSO GENERATE: 5 hook options · 2 CTA options.`;

    case "medium":
      return `You are an expert Medium writer.

${sb}

Write a Medium ${sub === "Response post" ? "opinion piece (600–900 words)" : "adapted article (1,200–1,800 words)"}.

${sub === "Response post"
  ? `Frame as response to a common narrative. Take a clear position on ${b.problem}.`
  : `Adapt for Medium's literary audience. Personal 'I' voice. Richer prose.`}

REQUIRED ELEMENTS:
- 2 subtitle options
- Open with scene/question/bold statement
- Introduce "${fw}" with ${ex(e, "framework_analogy")} as analogy
- 1–2 pull quotes as blockquotes
- ${ex(e, "case_study_industry")} example woven naturally
- Clear takeaway paragraph
- 5 Medium tags

WRITING RULES: Richer prose · personal not indulgent · structure with momentum.`;

    case "facebook":
      return `You are an expert Facebook content strategist.

${sb}

Write a Facebook post (400–600 words) based on this article.

REQUIRED STRUCTURE:
- Hook: human, relatable
- Context
- Problem/insight: ${b.problem}
- Breakdown: 2–4 points using "${fw}"
- Story/example: ${cs}
- Takeaway
- CTA: one action only

WRITING RULES: Conversational · stories work · clarity + community interaction.

ALSO GENERATE: 3 hook options · 3 CTA options.`;

    case "youtube":
      return `You are an expert YouTube scriptwriter.

${sb}

Write a YouTube ${sub === "Shorts script" ? "Shorts script (45–60s)" : "long-form script (8–12 min, ~1,500–2,000 words)"} based on this article.

REQUIRED STRUCTURE:
- Hook (0–30s): Reference "${ex(e, "hook_stat")}"
- Promise: what viewer learns from "${fw}"
- Context: frame ${b.problem}
- Framework intro with ${ex(e, "framework_analogy")}
- Section 1: ${p1}
- Section 2: ${p2}
- Section 3: ${p3}
- Demo: ${cs}
- Recap
- CTA: one action only

WRITING RULES: Spoken language · re-engage attention · explain then show · distinct chapters.

ALSO GENERATE: 3 title options · 3 thumbnail text options · chapter timestamps · CTA options.`;
  }
  return "";
}
