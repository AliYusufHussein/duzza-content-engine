export type Brief = {
  channel?: string;
  toneProfile?: any;
  content_goal?: string;
  topic: string;
  audience: string;
  niche: string;
  problem: string;
  solution: string;
  stat: string;
  authority: string;
  wordcount: string;
  format: string;
  tone: string;
  fwstyle: string;
  kw1: string;
  kw2: string;
  slug: string;
  meta: string;
  img1: string;
  img2: string;
  img3: string;
  img4: string;
  img6: string;
  extras: string[];
  context: string;
  // Stage 4
  sequencing: string;
  goal: string;
  toneAcross: string;
  cta_chips: string[];
  platformSubs: Record<string, string>;
};

export type Extraction = Record<string, any>;

export const defaultBrief = (): Brief => ({
  channel: "",
  toneProfile: null,
  content_goal: "",
  topic: "", audience: "", niche: "", problem: "", solution: "", stat: "", authority: "",
  wordcount: "1,500–2,000", format: "how-to guide", tone: "Authoritative", fwstyle: "3-Pillar system",
  kw1: "", kw2: "", slug: "", meta: "",
  img1: "", img2: "", img3: "", img4: "", img6: "",
  extras: ["3 headline options", "Meta description", "URL slug", "Checklist sign-off", "Social hooks (×5)"],
  context: "",
  sequencing: "Blog first → social follow-up",
  goal: "Drive blog traffic",
  toneAcross: "Consistent tone",
  cta_chips: ["Link to blog"],
  platformSubs: { linkedin: "Article", twitter: "Thread", tiktok: "Educational", email: "Newsletter", reddit: "Data analysis" },
});

export const PLATFORMS: { key: string; name: string; desc: string; defaultOn: boolean; subs: string[] }[] = [
  { key: "linkedin", name: "LinkedIn", desc: "Long-form article or short post", defaultOn: true, subs: ["Article", "Short post"] },
  { key: "twitter", name: "X / Twitter", desc: "Thread or single tweet", defaultOn: true, subs: ["Thread", "Single tweet"] },
  { key: "tiktok", name: "TikTok", desc: "Short video script", defaultOn: true, subs: ["Educational", "POV story", "Trending hook"] },
  { key: "email", name: "Email", desc: "Newsletter or drip", defaultOn: true, subs: ["Newsletter", "Drip sequence"] },
  { key: "reddit", name: "Reddit", desc: "Community-native posts", defaultOn: true, subs: ["Data analysis", "Discussion"] },
  { key: "instagram", name: "Instagram", desc: "Carousel, post or reel", defaultOn: false, subs: ["Carousel", "Single post", "Reels"] },
  { key: "telegram", name: "Telegram", desc: "Channel broadcasts", defaultOn: false, subs: ["Exclusive insight", "Discussion"] },
  { key: "medium", name: "Medium", desc: "Literary adaptation", defaultOn: false, subs: ["Adaptation", "Response post"] },
  { key: "facebook", name: "Facebook", desc: "Conversational post", defaultOn: false, subs: ["Standard post", "Story"] },
  { key: "youtube", name: "YouTube", desc: "Video script", defaultOn: false, subs: ["Long-form script", "Shorts script"] },
];
