import fs from "node:fs";
import path from "node:path";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const SITE_URL = "https://evopsych.xyz";
const root = path.resolve(import.meta.dirname, "..");
const distDir = path.join(root, "dist", "public");
const seedPath = path.resolve(root, "..", "api-server", "src", "lib", "seed.ts");

const WEEK_META: Record<number, { title: string; summary: string }> = {
  1: {
    title: "Week 1 — Foundations of evolutionary psychology",
    summary:
      "Natural selection, adaptation, genes, sexual selection, inclusive fitness, the adapted mind, and levels of explanation.",
  },
  2: {
    title: "Week 2 — Survival and the evolved individual",
    summary:
      "The evolved body, food and fear, threat detection, habitat preferences, disease avoidance, life history, and development.",
  },
  3: {
    title: "Week 3 — Mating and reproduction",
    summary:
      "Parental investment, mate preferences, short- and long-term strategies, attraction, jealousy, and parenting.",
  },
  4: {
    title: "Week 4 — Social life, cooperation, and culture",
    summary:
      "Kinship, cooperation, aggression, status, coalitions, language, emotions, culture, religion, and synthesis.",
  },
};

function readSeedTopics(): SeedTopic[] {
  const source = fs.readFileSync(seedPath, "utf8");
  const match = source.match(
    /const TOPICS: SeedTopic\[\] = ([\s\S]*?)\n\];\n\ntype SeedAssignment/,
  );
  if (!match?.[1]) {
    throw new Error(`Could not find TOPICS in ${seedPath}`);
  }

  // The seed records are plain JavaScript object literals inside this typed
  // file. Reading that canonical block avoids maintaining a second lecture
  // catalog solely for static HTML and the sitemap.
  const topics = Function(`"use strict"; return (${match[1]}\n]);`)() as unknown;
  if (
    !Array.isArray(topics) ||
    topics.some(
      (topic) =>
        typeof topic !== "object" ||
        topic === null ||
        typeof (topic as SeedTopic).lectureTitle !== "string" ||
        typeof (topic as SeedTopic).body !== "string",
    )
  ) {
    throw new Error("Seed TOPICS did not produce valid public lecture records");
  }
  return topics as SeedTopic[];
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function inlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const html: string[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
      list = [];
    }
  };

  for (const line of lines) {
    if (!line.trim()) {
      flushParagraph();
      flushList();
    } else if (/^#{2,6}\s/.test(line)) {
      flushParagraph();
      flushList();
      const level = line.match(/^#+/)?.[0].length ?? 2;
      html.push(`<h${level}>${inlineMarkdown(line.replace(/^#+\s+/, ""))}</h${level}>`);
    } else if (/^-\s/.test(line)) {
      flushParagraph();
      list.push(line.replace(/^-\s+/, ""));
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }
  flushParagraph();
  flushList();
  return html.join("\n");
}

function pageShell(indexHtml: string, content: string): string {
  return indexHtml.replace(
    /<body>[\s\S]*?<\/body>/,
    `<body><div id="root">${content}</div></body>`,
  );
}

function pageHead(indexHtml: string, title: string, description: string, url: string): string {
  return indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta name="description" content="[\s\S]*?" \/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${url}" />`)
    .replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${escapeHtml(description)}" />`)
    .replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${url}" />`)
    .replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${escapeHtml(title)}" />`)
    .replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/, `<meta name="twitter:description" content="${escapeHtml(description)}" />`);
}

function writePage(
  indexHtml: string,
  relativeDir: string,
  title: string,
  description: string,
  content: string,
) {
  const dir = path.join(distDir, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  const url = `${SITE_URL}/${relativeDir.replace(/\\/g, "/")}/`;
  const html = pageShell(pageHead(indexHtml, title, description, url), content);
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

function buildSitemap(topics: SeedTopic[]): string {
  const urls = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/qr-course-demo/", changefreq: "monthly", priority: "0.8" },
    ...Object.keys(WEEK_META).map((week) => ({
      path: `/weeks/${week}/`,
      changefreq: "monthly",
      priority: "0.8",
    })),
    ...topics.map((_, index) => ({
      path: `/lectures/${index + 1}/`,
      changefreq: "monthly",
      priority: "0.7",
    })),
  ];
  const entries = urls
    .map(
      ({ path: route, changefreq, priority }) =>
        `  <url><loc>${SITE_URL}${route}</loc><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

const topics = readSeedTopics();
if (topics.length !== 29) {
  throw new Error(`Expected 29 public lecture records, found ${topics.length}`);
}
const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

for (const [week, meta] of Object.entries(WEEK_META)) {
  const weekNumber = Number(week);
  const lectures = topics
    .map((topic, index) => ({ topic, id: index + 1 }))
    .filter(({ topic }) => topic.weekNumber === weekNumber);
  const content = `
    <main class="seo-fallback">
      <p><a href="/">EvoPsych</a> · Week ${weekNumber}</p>
      <h1>${escapeHtml(meta.title)}</h1>
      <p>${escapeHtml(meta.summary)}</p>
      <section aria-labelledby="week-lectures-heading">
        <h2 id="week-lectures-heading">Lectures in this week</h2>
        <ul>
          ${lectures
            .map(
              ({ topic, id }) =>
                `<li><a href="/lectures/${id}/">${escapeHtml(topic.lectureTitle)}</a><p>${escapeHtml(topic.blurb)}</p></li>`,
            )
            .join("\n")}
        </ul>
      </section>
    </main>`;
  writePage(
    indexHtml,
    `weeks/${weekNumber}`,
    `${meta.title} | Evolutionary Psychology`,
    `${meta.summary} Explore the ${lectures.length} public micro-lectures in this week of the free EvoPsych course.`,
    content,
  );
}

for (const [index, topic] of topics.entries()) {
  const id = index + 1;
  const bodyHtml = markdownToHtml(topic.body.replace(/^#\s+.+\n+/, ""));
  const content = `
    <main class="seo-fallback">
      <p><a href="/weeks/${topic.weekNumber}/">Week ${topic.weekNumber}</a> · Micro-lecture ${id}</p>
      <article>
        <header>
          <h1>${escapeHtml(topic.lectureTitle)}</h1>
          <p>${escapeHtml(topic.blurb)}</p>
        </header>
        <div class="lecture-content">${bodyHtml}</div>
      </article>
      <p><a href="/weeks/${topic.weekNumber}/">Back to Week ${topic.weekNumber}</a></p>
    </main>`;
  writePage(
    indexHtml,
    `lectures/${id}`,
    `${topic.lectureTitle} | Evolutionary Psychology`,
    `${topic.blurb} Read this free evolutionary psychology micro-lecture from Week ${topic.weekNumber}.`,
    content,
  );
}

fs.writeFileSync(path.join(distDir, "sitemap.xml"), buildSitemap(topics));
console.log(`Generated SEO HTML for ${Object.keys(WEEK_META).length} weeks and ${topics.length} lectures`);