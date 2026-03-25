import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, ExternalHyperlink, PageBreak,
  LevelFormat, UnderlineType
} from "docx";
import fs from "fs";

const ORANGE = "E8760A";
const DARK = "1A1A1A";
const LIGHT_ORANGE = "FDF0E3";
const CREAM = "FAFAF7";
const GREY_BG = "F5F5F5";
const LIGHT_GREY = "E8E8E8";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, font: "Arial", color: DARK })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    children: [new TextRun({ text, bold: true, size: 26, font: "Arial", color: ORANGE })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, font: "Arial", color: DARK })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK, ...opts })],
  });
}

function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function spacer() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [new TextRun("")] });
}

function orangeBar(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    shading: { fill: ORANGE, type: ShadingType.CLEAR },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: WHITE })],
    indent: { left: 180, right: 180 },
  });
}

function bullet(text, level = 0) {
  return {
    numbering: { reference: "bullets", level },
    spacing: { before: 60, after: 60 },
    indent: { left: 720, hanging: 360 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })],
  };
}

function numbered(text, level = 0) {
  return {
    numbering: { reference: "numbers", level },
    spacing: { before: 60, after: 60 },
    indent: { left: 720, hanging: 360 },
    children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })],
  };
}

function codeBox(lines) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            width: { size: 9360, type: WidthType.DXA },
            children: lines.map(line =>
              new Paragraph({
                spacing: { before: 20, after: 20 },
                children: [new TextRun({ text: line, size: 18, font: "Courier New", color: "E8D5B7" })],
              })
            ),
          }),
        ],
      }),
    ],
  });
}

function infoBox(text, bg = LIGHT_ORANGE) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders,
            shading: { fill: bg, type: ShadingType.CLEAR },
            margins: { top: 160, bottom: 160, left: 240, right: 240 },
            width: { size: 9360, type: WidthType.DXA },
            children: [new Paragraph({
              children: [new TextRun({ text, size: 22, font: "Arial", color: DARK })],
            })],
          }),
        ],
      }),
    ],
  });
}

function twoCol(left, right, leftW = 4500, rightW = 4860) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [leftW, rightW],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            width: { size: leftW, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 0, right: 240 },
            children: left,
          }),
          new TableCell({
            borders: noBorders,
            width: { size: rightW, type: WidthType.DXA },
            margins: { top: 80, bottom: 80, left: 240, right: 0 },
            children: right,
          }),
        ],
      }),
    ],
  });
}

function kpiTable(rows) {
  const headerRow = new TableRow({
    children: [
      new TableCell({
        borders,
        shading: { fill: ORANGE, type: ShadingType.CLEAR },
        width: { size: 3120, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({ children: [new TextRun({ text: "Metric", bold: true, size: 20, font: "Arial", color: WHITE })] })],
      }),
      new TableCell({
        borders,
        shading: { fill: ORANGE, type: ShadingType.CLEAR },
        width: { size: 2080, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({ children: [new TextRun({ text: "Week 1", bold: true, size: 20, font: "Arial", color: WHITE })] })],
      }),
      new TableCell({
        borders,
        shading: { fill: ORANGE, type: ShadingType.CLEAR },
        width: { size: 2080, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({ children: [new TextRun({ text: "Month 1", bold: true, size: 20, font: "Arial", color: WHITE })] })],
      }),
      new TableCell({
        borders,
        shading: { fill: ORANGE, type: ShadingType.CLEAR },
        width: { size: 2080, type: WidthType.DXA },
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        children: [new Paragraph({ children: [new TextRun({ text: "Month 3", bold: true, size: 20, font: "Arial", color: WHITE })] })],
      }),
    ],
  });
  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: row.map((cell, j) =>
        new TableCell({
          borders,
          shading: { fill: i % 2 === 0 ? WHITE : GREY_BG, type: ShadingType.CLEAR },
          width: { size: j === 0 ? 3120 : 2080, type: WidthType.DXA },
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, bold: j === 0, size: 20, font: "Arial", color: DARK })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 2080, 2080, 2080],
    rows: [headerRow, ...dataRows],
  });
}

function dayTable(rows) {
  const header = new TableRow({
    children: ["Day", "Task", "Time", "Status"].map((t, i) =>
      new TableCell({
        borders,
        shading: { fill: DARK, type: ShadingType.CLEAR },
        width: { size: [840, 5520, 1560, 1440][i], type: WidthType.DXA },
        margins: { top: 100, bottom: 100, left: 160, right: 160 },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, font: "Arial", color: WHITE })] })],
      })
    ),
  });
  const dataRows = rows.map((row, i) =>
    new TableRow({
      children: row.map((cell, j) =>
        new TableCell({
          borders,
          shading: { fill: i % 2 === 0 ? WHITE : GREY_BG, type: ShadingType.CLEAR },
          width: { size: [840, 5520, 1560, 1440][j], type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 160, right: 160 },
          children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial", color: DARK })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [840, 5520, 1560, 1440],
    rows: [header, ...dataRows],
  });
}

// ─── DOCUMENT ────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "numbers2",
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
      {
        reference: "bullets2",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } },
        }],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: ORANGE },
        paragraph: { spacing: { before: 300, after: 100 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 22, bold: true, font: "Arial", color: DARK },
        paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 2 },
      },
    ],
  },
  sections: [
    {
      // ── Title page ──
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ORANGE } },
              spacing: { after: 120 },
              children: [
                new TextRun({ text: "MELA  |  CONFIDENTIAL CO-FOUNDER PLAYBOOK", size: 18, font: "Arial", color: "999999" }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: ORANGE } },
              spacing: { before: 120 },
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({ text: "melaa.ca  |  Page ", size: 18, font: "Arial", color: "999999" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial", color: "999999" }),
              ],
            }),
          ],
        }),
      },
      children: [
        // Cover block
        spacer(), spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 80 },
          children: [new TextRun({ text: "MELA", bold: true, size: 72, font: "Arial", color: ORANGE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "melaa.ca", size: 28, font: "Arial", color: "999999" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 400 },
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 8, color: ORANGE },
          },
          children: [new TextRun({ text: "Co-Founder #3 — Sales & Partnerships Playbook", bold: true, size: 36, font: "Arial", color: DARK })],
        }),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 60 },
          children: [new TextRun({ text: "Your complete step-by-step guide to driving revenue,", size: 24, font: "Arial", color: DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "closing vendor upgrades, and building strategic partnerships", size: 24, font: "Arial", color: DARK })],
        }),
        spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 60, after: 60 },
          children: [new TextRun({ text: "Version: March 2026", size: 20, font: "Arial", color: "888888" })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: "Prepared by: Ishaan Saini, Founder & CEO", size: 20, font: "Arial", color: "888888" })],
        }),
        spacer(), spacer(), spacer(),
        infoBox("NOTE: The AI agents are running 24/7 in the background handling cold email, lead notifications, revenue monitoring, and financial reporting. Your job is the human work — sales calls, vendor relationships, strategic deals, and revenue growth that only a person can close.", LIGHT_ORANGE),
        pb(),

        // ── SECTION 1: MISSION ──
        h1("Section 1 — Your Role & The Mission"),
        p("Melaa (melaa.ca) is the GTA's only marketplace built exclusively for South Asian weddings. We connect couples planning South Asian weddings with verified, culturally-aware vendors across Toronto, Brampton, Mississauga, Markham, and Vaughan."),
        spacer(),
        h2("What We're Building"),
        p("The market: South Asian weddings in Canada are a $2B+ industry. The GTA has the highest concentration of South Asian families in North America outside of India. No one has built a dedicated, trusted marketplace for this community. We are."),
        spacer(),
        h2("Current State — March 2026"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            ["Active Vendors", "5"],
            ["MRR", "$795/month"],
            ["Platform Valuation", "$76,320"],
            ["AI Agents Running", "9 departments, 24/7"],
            ["Live at", "melaa.ca"],
          ].map(([k, v], i) => new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 22, font: "Arial" })] })],
              }),
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, font: "Arial", color: ORANGE, bold: true })] })],
              }),
            ],
          })),
        }),
        spacer(),
        h2("Your Role: Sales & Partnerships Co-Founder"),
        p("You are responsible for all revenue-generating activities that require a human. This includes:"),
        new Paragraph({ ...bullet("Vendor sales — converting free listings to paid plans ($99–$297/mo)") }),
        new Paragraph({ ...bullet("Upselling existing paid vendors to higher tiers") }),
        new Paragraph({ ...bullet("Venue & event planner partnerships") }),
        new Paragraph({ ...bullet("Corporate deals with South Asian community organizations") }),
        new Paragraph({ ...bullet("Sponsorship packages for community events") }),
        new Paragraph({ ...bullet("Investor and press relationship building") }),
        new Paragraph({ ...bullet("Attending South Asian wedding expos and industry events") }),
        spacer(),
        h2("90-Day Revenue Goals"),
        kpiTable([
          ["Paid vendors", "7", "15", "35"],
          ["MRR", "$1,200", "$2,000", "$5,000"],
          ["Partnerships closed", "1", "3", "8"],
          ["Sales calls made", "10", "40", "100"],
          ["Vendor upgrades", "2", "8", "20"],
        ]),
        pb(),

        // ── SECTION 2: PRICING ──
        h1("Section 2 — Pricing & What You're Selling"),
        p("Know this by heart. You will be asked constantly."),
        spacer(),
        h2("The Three Plans"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3120, 3120, 3120],
          rows: [
            new TableRow({
              children: ["FREE", "BASIC — $99/mo", "PREMIUM — $249/mo"].map((t, i) =>
                new TableCell({
                  borders,
                  shading: { fill: [GREY_BG, LIGHT_ORANGE, ORANGE][i], type: ShadingType.CLEAR },
                  width: { size: 3120, type: WidthType.DXA },
                  margins: { top: 160, bottom: 160, left: 200, right: 200 },
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: t, bold: true, size: 24, font: "Arial", color: i === 2 ? WHITE : DARK })] })],
                })
              ),
            }),
            new TableRow({
              children: [
                ["Basic listing", "Name + category only", "No priority", "No badge"].join("\n"),
                ["Full profile + photos", "Priority in search", "Verified badge", "Lead notifications"],
                ["Everything in Basic", "Top of all searches", "Featured on homepage", "Analytics dashboard", "Dedicated account manager"],
              ].map((items, i) =>
                new TableCell({
                  borders,
                  shading: { fill: WHITE, type: ShadingType.CLEAR },
                  width: { size: 3120, type: WidthType.DXA },
                  margins: { top: 120, bottom: 120, left: 180, right: 180 },
                  children: (typeof items === "string" ? items.split("\n") : items).map(item =>
                    new Paragraph({
                      spacing: { before: 60, after: 60 },
                      children: [new TextRun({ text: `\u2022  ${item}`, size: 20, font: "Arial", color: DARK })],
                    })
                  ),
                })
              ),
            }),
          ],
        }),
        spacer(),
        infoBox("FOUNDING VENDOR DEAL: First 50 vendors who upgrade get locked in at $49/mo forever (normally $99/mo Basic or $249/mo Premium). This is your best sales tool — use urgency around the 50-vendor cap.", LIGHT_ORANGE),
        spacer(),
        h2("The Founding Vendor Pitch (Memorize This)"),
        codeBox([
          "\"We're in our founding period — the first 50 vendors who join get their",
          " rate locked forever. Right now that means you pay $49/month instead",
          " of $99, forever, no matter what we charge new vendors in the future.",
          "",
          " The platform is already live. Couples are already searching. And the",
          " vendors who get in early get the most visibility before the directory",
          " fills up with competition in your category.\"",
          "",
          " [Pause. Let them respond.]",
        ]),
        spacer(),
        h2("Handling Objections"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3600, 5760],
          rows: [
            ["Objection", "Response"],
            ["\"How many couples are actually on here?\"", "\"Couples are searching daily — we're growing fast and this is exactly why early vendors get the most leads. The directory works like Google: the first vendors listed get the most clicks.\""],
            ["\"I already get leads from Instagram/word of mouth\"", "\"That's great — Melaa is a different channel, not a replacement. It captures couples actively searching for vendors right now, which your Instagram doesn't.\""],
            ["\"$49/mo is still a lot for me\"", "\"One booking pays for 6+ months. If you get even one wedding from this in your first year, it's paid for itself 10x over.\""],
            ["\"I need to think about it\"", "\"Totally fair. I'll send you the listing link. Just know the founding rate closes once we hit 50 vendors — we're at [current count] now.\""],
            ["\"Is this legit?\"", "\"Go to melaa.ca right now and check it out. Fully live, fully functional. Here's the link.\""],
          ].map(([q, a], i) => new TableRow({
            children: [q, a].map((cell, j) =>
              new TableCell({
                borders,
                shading: { fill: i === 0 ? DARK : (i % 2 === 0 ? WHITE : GREY_BG), type: ShadingType.CLEAR },
                width: { size: [3600, 5760][j], type: WidthType.DXA },
                margins: { top: 120, bottom: 120, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial", bold: i === 0, color: i === 0 ? WHITE : DARK })] })],
              })
            ),
          })),
        }),
        pb(),

        // ── SECTION 3: WEEK 1 PLAN ──
        h1("Section 3 — Week 1: Day-by-Day Action Plan"),
        infoBox("Your only job this week: make contact with 50 vendors. Get 5 to upgrade. These are achievable numbers — the outreach scripts are all copy-paste ready below.", LIGHT_ORANGE),
        spacer(),
        h2("Day-by-Day Schedule"),
        dayTable([
          ["1", "Set up admin access, review vendor list, review pricing, make 10 WhatsApp outreach contacts", "3 hrs", "Priority #1"],
          ["1", "Send personal network email (25 contacts) asking for referrals", "45 min", "Priority #2"],
          ["2", "Make 10 more WhatsApp/DM outreach contacts from Instagram hashtag search", "2 hrs", "Priority #1"],
          ["2", "Follow up on Day 1 contacts who haven't replied", "30 min", "Priority #2"],
          ["2", "Research 3 South Asian wedding venues in GTA for partnership pitch", "1 hr", "Priority #3"],
          ["3", "First venue partnership email — send to 3 venues", "45 min", "Priority #1"],
          ["3", "10 more vendor outreach DMs on Instagram", "2 hrs", "Priority #2"],
          ["3", "Check melaa.ca/admin — call any vendor who signed up free to pitch upgrade", "1 hr", "Priority #1"],
          ["4", "Sales call script practice — role play the pitch 5 times", "30 min", "Priority #2"],
          ["4", "Research 5 South Asian event planners in GTA, send partnership pitch", "1 hr", "Priority #2"],
          ["4", "10 vendor WhatsApp outreach", "2 hrs", "Priority #1"],
          ["5", "Follow up every Day 1–3 contact who hasn't responded", "1 hr", "Priority #1"],
          ["5", "Research local South Asian wedding expos / bridal shows in GTA", "30 min", "Priority #3"],
          ["5", "10 more vendor DMs", "2 hrs", "Priority #2"],
          ["6", "Full week review — how many contacted, how many signed up, how many upgraded?", "30 min", "Priority #1"],
          ["6", "Send upgrade pitch to any free vendors who signed up this week", "1 hr", "Priority #1"],
          ["7", "Plan Week 2 outreach list (50 new vendors)", "45 min", "Planning"],
        ]),
        pb(),

        // ── SECTION 4: VENDOR OUTREACH SCRIPTS ──
        h1("Section 4 — Vendor Outreach Scripts (Copy-Paste Ready)"),
        h2("Finding Vendors to Contact"),
        p("Search these hashtags on Instagram and Google Maps — find every South Asian wedding vendor in GTA:"),
        new Paragraph({ ...bullet("Instagram: #bramptonweddingphotographer #gtamehndi #mississaugaweddingdecor") }),
        new Paragraph({ ...bullet("Instagram: #southasianweddingphotographertoronto #desidjgta #gtacaterer") }),
        new Paragraph({ ...bullet("Google Maps: search 'South Asian wedding photographer Brampton', 'Indian catering Mississauga'") }),
        new Paragraph({ ...bullet("WeddingWire Canada: filter by South Asian/Indian wedding vendors in GTA") }),
        new Paragraph({ ...bullet("Facebook Groups: South Asian Brides Canada, Desi Weddings GTA") }),
        spacer(),
        h2("WhatsApp Opening Message"),
        codeBox([
          "Hey [Name] \ud83d\udc4b I'm [Your Name], I work with Melaa.ca \u2014 a South Asian",
          "wedding vendor directory for the GTA.",
          "",
          "We're getting couples searching for [Photography/Decor/etc] in",
          "[their city] every day and I'd love to feature [Business Name].",
          "",
          "Takes 5 minutes to set up a free profile. Would this be useful?",
        ]),
        spacer(),
        h2("WhatsApp Follow-Up (Day 3, No Reply)"),
        codeBox([
          "Hey [Name], just following up in case this got buried!",
          "",
          "Quick question \u2014 do you currently get leads online or is it mainly",
          "word of mouth? Asking because I want to make sure Melaa is actually",
          "useful for vendors like you before I feature you.",
        ]),
        spacer(),
        h2("WhatsApp Upgrade Pitch (After They List Free)"),
        codeBox([
          "Hey [Name]! Great to see [Business Name] listed on Melaa \ud83e\udd73",
          "",
          "Quick heads up \u2014 we're still in our founding period and the first",
          "50 vendors who upgrade get locked in at $49/month forever (normally",
          "$99/mo Basic or $249/mo Premium).",
          "",
          "You'd get priority placement in search results + a Verified badge",
          "which couples really trust. We're at [X] vendors right now so the",
          "founding rate won't last long.",
          "",
          "Want me to send you the upgrade link?",
        ]),
        spacer(),
        h2("Instagram DM — Initial Outreach"),
        codeBox([
          "Hey [Name]! Love your work \ud83d\ude4c",
          "",
          "I'm [Your Name] from Melaa \u2014 we're building a wedding vendor",
          "marketplace specifically for South Asian weddings in the GTA",
          "(melaa.ca).",
          "",
          "We're handpicking the best vendors to feature early. Would you",
          "be open to a free listing? Couples in [City] are already searching",
          "on the platform.",
        ]),
        spacer(),
        h2("Instagram DM Follow-Up (Day 3)"),
        codeBox([
          "Hey [Name], following up on my message! We just had a couple",
          "search for [their category] in [their city] today \u2014 wanted to",
          "make sure you're listed before they find someone else.",
          "",
          "Free to list: melaa.ca/list-your-business \ud83e\udda7",
        ]),
        spacer(),
        h2("Cold Email to Vendor"),
        codeBox([
          "Subject: Free listing for [Business Name] on Melaa.ca",
          "",
          "Hi [Name],",
          "",
          "I found [Business Name] while searching for South Asian wedding",
          "[category] in [city] and wanted to reach out.",
          "",
          "I'm co-founding Melaa \u2014 a marketplace specifically for South Asian",
          "wedding vendors in the GTA. Every vendor is local and familiar",
          "with South Asian culture.",
          "",
          "I'd love to feature [Business Name] for free. Your profile goes",
          "live same day, and you get notified when couples contact you.",
          "",
          "Link: melaa.ca/list-your-business",
          "",
          "Let me know if you have any questions \u2014 happy to jump on a",
          "quick call too.",
          "",
          "Best,",
          "[Your Name]",
          "Co-Founder, Melaa | melaa.ca",
        ]),
        pb(),

        // ── SECTION 5: SALES CALLS ──
        h1("Section 5 — Sales Call Scripts"),
        h2("Before the Call — Prepare"),
        new Paragraph({ ...bullet("Look up the vendor on Instagram/Google before calling") }),
        new Paragraph({ ...bullet("Know their category and city") }),
        new Paragraph({ ...bullet("Check if they're already listed on melaa.ca") }),
        new Paragraph({ ...bullet("Have melaa.ca open on your screen") }),
        spacer(),
        h2("Opening the Call"),
        codeBox([
          "\"Hi, is this [Name]? Hi [Name], this is [Your Name] calling from",
          "Melaa \u2014 we're building a South Asian wedding vendor directory for",
          "the GTA. I found [Business Name] while looking for [category] in",
          "[city] and wanted to reach out personally. Do you have 2 minutes?\"",
        ]),
        spacer(),
        h2("If They Say Yes — Main Pitch"),
        codeBox([
          "\"Great. So Melaa is a marketplace built specifically for South Asian",
          "wedding vendors \u2014 it's live at melaa.ca. We're getting couples",
          "searching for [category] in [city] daily, and I wanted to make sure",
          "[Business Name] is one of the first vendors they see.",
          "",
          "It's completely free to list, profile goes live same day.",
          "",
          "We also have a founding vendor rate \u2014 the first 50 businesses that",
          "upgrade get locked in at $49/month forever. That's for priority",
          "placement and a verified badge. We're at [X vendors] right now.",
          "",
          "Would you want me to set up your profile right now while I have",
          "you on the phone?\"",
        ]),
        spacer(),
        h2("Closing the Call"),
        codeBox([
          "Option A (they're interested):",
          "\"Perfect. I'll send you the link right now. It's melaa.ca/list-your-",
          "business. Let me know if anything's confusing and I'll help you",
          "through it. And I'll follow up in a couple days to make sure",
          "everything's set up.\"",
          "",
          "Option B (they want to think about it):",
          "\"Totally understand. I'll send you a quick text with the link.",
          "The founding rate closes once we hit 50 vendors \u2014 we're at [X]",
          "right now. No pressure, just wanted to give you first access.\"",
          "",
          "Option C (they say no):",
          "\"No problem at all \u2014 appreciate the time. If you ever want to list",
          "in the future, melaa.ca is always free. Take care!\"",
        ]),
        pb(),

        // ── SECTION 6: PARTNERSHIPS ──
        h1("Section 6 — Partnership Outreach (High-Value Revenue)"),
        p("Partnerships unlock revenue streams beyond individual vendors. A single venue deal can be worth $500–$2,000/year in recurring revenue."),
        spacer(),
        h2("Partnership Types & What You Offer"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3000, 3180, 3180],
          rows: [
            new TableRow({
              children: ["Partner Type", "What They Get", "What We Get"].map(t =>
                new TableCell({
                  borders,
                  shading: { fill: ORANGE, type: ShadingType.CLEAR },
                  width: { size: 3120, type: WidthType.DXA },
                  margins: { top: 120, bottom: 120, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 20, font: "Arial", color: WHITE })] })],
                })
              ),
            }),
            ...[
              ["Wedding Venues", "Listed as preferred venue on Melaa + badge on vendor profiles", "Vendor referrals + revenue split or flat fee $300/yr"],
              ["Event Planners", "Co-branded resource page, planner badge on Melaa", "Their clients referred to Melaa vendors + $200/yr"],
              ["South Asian Community Centers", "Free vendor listings for their community partners", "Reach to their entire membership network"],
              ["South Asian Wedding Expos", "Melaa listed as official marketplace partner", "Booth/table at event, email list access"],
              ["Bridal Boutiques", "Cross-promotion to their clients", "Referral link + $100/referral who upgrades"],
              ["Mortgage Brokers / Real Estate", "We cross-promote to their South Asian clients", "They refer newly engaged couples to Melaa"],
            ].map(([type, gets, weGet], i) => new TableRow({
              children: [type, gets, weGet].map((cell, j) =>
                new TableCell({
                  borders,
                  shading: { fill: i % 2 === 0 ? WHITE : GREY_BG, type: ShadingType.CLEAR },
                  width: { size: [3000, 3180, 3180][j], type: WidthType.DXA },
                  margins: { top: 100, bottom: 100, left: 160, right: 160 },
                  children: [new Paragraph({ children: [new TextRun({ text: cell, size: 20, font: "Arial" })] })],
                })
              ),
            })),
          ],
        }),
        spacer(),
        h2("Venue Partnership Email"),
        codeBox([
          "Subject: Partnership opportunity \u2014 South Asian wedding vendors for",
          "[Venue Name]",
          "",
          "Hi [Name],",
          "",
          "I'm [Your Name], co-founder of Melaa (melaa.ca) \u2014 the GTA's first",
          "marketplace built exclusively for South Asian wedding vendors.",
          "",
          "We work with photographers, caterers, decorators, and mehndi",
          "artists specifically serving the South Asian community across",
          "Brampton, Mississauga, Toronto, and Markham.",
          "",
          "I'd love to explore a partnership with [Venue Name]:",
          "",
          " - Feature [Venue Name] as a preferred venue on Melaa",
          " - Include your listing on every relevant vendor profile",
          " - Cross-promote to our growing list of couples actively",
          "   planning South Asian weddings in the GTA",
          "",
          "In return, we'd appreciate any referrals to vendors you work",
          "with and mention to couples planning South Asian events.",
          "",
          "Would you be open to a 15-minute call to explore this?",
          "",
          "Best,",
          "[Your Name]",
          "Co-Founder, Melaa | melaa.ca",
        ]),
        spacer(),
        h2("Event Planner Partnership Email"),
        codeBox([
          "Subject: Melaa \u00d7 [Planner Name] \u2014 partnership for South Asian",
          "wedding clients",
          "",
          "Hi [Name],",
          "",
          "I'm co-founding Melaa \u2014 a marketplace specifically for South Asian",
          "wedding vendors in the GTA. I came across [Planner Name] while",
          "researching the best planners who serve the South Asian community.",
          "",
          "I'd love to explore a partnership. Here's what I'm thinking:",
          "",
          " - Your clients get a curated shortlist of verified vendors from",
          "   Melaa for any category they need",
          " - You're featured on Melaa as a recommended planner",
          " - We cross-promote each other to our respective audiences",
          "",
          "No fees involved \u2014 this is purely a referral and visibility",
          "arrangement that benefits both our clients.",
          "",
          "Would a quick call work this week?",
          "",
          "[Your Name]",
          "Co-Founder, Melaa | melaa.ca",
        ]),
        spacer(),
        h2("Community Organization Pitch"),
        codeBox([
          "Subject: Free resources for your South Asian community members",
          "",
          "Hi [Name],",
          "",
          "I'm building Melaa (melaa.ca) \u2014 a free marketplace for South Asian",
          "wedding vendors in the GTA. We're looking to partner with",
          "community organizations like [Org Name] to make sure your members",
          "have access to trusted, culturally-aware vendors.",
          "",
          "What we'd offer:",
          " - Free listings for any vendors in your network",
          " - A shareable resource link for members planning weddings",
          " - Newsletter feature to our growing list of GTA couples",
          "",
          "No cost, no commitment. Just a genuine resource for your community.",
          "",
          "Would this be something you'd want to share with your members?",
          "",
          "[Your Name]",
          "Co-Founder, Melaa | melaa.ca",
        ]),
        pb(),

        // ── SECTION 7: PERSONAL NETWORK EMAIL ──
        h1("Section 7 — Personal Network Email (Send Day 1)"),
        p("Send this to at least 25 people you know personally who are South Asian and/or connected to the wedding industry."),
        spacer(),
        h2("Email — Copy Paste"),
        codeBox([
          "Subject: quick favour \u2014 something I'm building",
          "",
          "Hey [Name],",
          "",
          "I just joined as co-founder of something I'm genuinely excited",
          "about and wanted to share it with people I actually know.",
          "",
          "It's called Melaa \u2014 melaa.ca \u2014 a wedding vendor marketplace",
          "built specifically for South Asian weddings in the GTA.",
          "Photographers, caterers, decorators, mehndi artists \u2014 all local,",
          "all familiar with South Asian culture, all in one place.",
          "",
          "Two things that would mean a lot:",
          "",
          "1. If you know anyone planning a South Asian wedding, send them",
          "   the link: melaa.ca",
          "",
          "2. If you know any wedding vendors (photographers, decorators,",
          "   caterers etc), send them: melaa.ca/list-your-business",
          "   It's completely free to list.",
          "",
          "That's it. No ask beyond that.",
          "",
          "Thanks \ud83d\ude4f",
          "",
          "[Your Name]",
        ]),
        pb(),

        // ── SECTION 8: WEDDING EXPOS ──
        h1("Section 8 — Wedding Expos & In-Person Events"),
        h2("Events to Research and Attend"),
        new Paragraph({ ...bullet("South Asian Bridal Show — Toronto (search 'South Asian bridal show GTA 2026')") }),
        new Paragraph({ ...bullet("Desi Bridal Show — Brampton/Mississauga") }),
        new Paragraph({ ...bullet("WeddingWire Vendor Events") }),
        new Paragraph({ ...bullet("Peel Region South Asian community events") }),
        new Paragraph({ ...bullet("Mandir/Gurdwara community events — approach organizers for table/sponsorship") }),
        spacer(),
        h2("What to Bring to Every Event"),
        new Paragraph({ ...numbered("Business cards with melaa.ca QR code on the back") }),
        new Paragraph({ ...numbered("Printed one-pager (see below for copy)") }),
        new Paragraph({ ...numbered("Your phone with melaa.ca open to demo") }),
        new Paragraph({ ...numbered("Founding vendor offer talking points memorized") }),
        spacer(),
        h2("One-Pager Copy (Print This)"),
        infoBox(
          "MELA — melaa.ca\n\nThe GTA's South Asian Wedding Vendor Marketplace\n\nFind verified photographers, decorators, caterers, mehndi artists, DJs, and makeup artists — all local to the GTA and familiar with South Asian weddings.\n\nFree for couples to browse.\nFree for vendors to list.\n\nFOUNDING VENDOR OFFER: First 50 vendors who upgrade get locked in at $49/mo forever.\n\nmelaa.ca/list-your-business",
          LIGHT_ORANGE
        ),
        spacer(),
        h2("Event Conversation Script"),
        codeBox([
          "[Approach vendor at their booth]",
          "",
          "\"Hi! I'm [Your Name] from Melaa \u2014 we're building a directory",
          "specifically for South Asian wedding vendors in the GTA. I'd love",
          "to feature [Business Name]. Do you have 30 seconds?\"",
          "",
          "[If yes]",
          "\"We're at melaa.ca \u2014 couples searching for [their category] in",
          "[city] find vendors directly. It's free to list, and we have a",
          "founding rate for the first 50 vendors. Here's my card with the",
          "link on the back \u2014 would you be open to me following up?\"",
          "",
          "[Get their number/email, follow up same evening]",
        ]),
        pb(),

        // ── SECTION 9: LINKEDIN ──
        h1("Section 9 — LinkedIn Strategy"),
        h2("Update Your LinkedIn Profile"),
        p("Update your LinkedIn headline and current role to:"),
        infoBox("Co-Founder @ Melaa | Building the GTA's South Asian Wedding Vendor Marketplace | melaa.ca", LIGHT_ORANGE),
        spacer(),
        h2("Day 1 LinkedIn Post"),
        codeBox([
          "I just joined as co-founder of something I've been excited about",
          "for a while.",
          "",
          "Melaa (melaa.ca) is the GTA's first marketplace built exclusively",
          "for South Asian wedding vendors.",
          "",
          "The problem is real: South Asian couples in Toronto, Brampton, and",
          "Mississauga spend hours on generic directories getting results that",
          "don't understand their culture, their traditions, or what makes a",
          "South Asian wedding what it is.",
          "",
          "We fix that. Every vendor on Melaa is local to the GTA and familiar",
          "with South Asian weddings.",
          "",
          "Free to browse. Free for vendors to list. Founding vendor rate",
          "available for the first 50 businesses.",
          "",
          "If you're in the South Asian wedding industry in the GTA \u2014 or know",
          "someone who is \u2014 I'd love to connect.",
          "",
          "melaa.ca | melaa.ca/list-your-business",
        ]),
        spacer(),
        h2("LinkedIn Connection Request Message"),
        codeBox([
          "[When connecting with vendors, venue owners, event planners]",
          "",
          "\"Hi [Name]! I'm co-founding Melaa \u2014 a South Asian wedding vendor",
          "marketplace for the GTA. I came across [Business/Profile] and",
          "would love to connect. I think there could be a great fit between",
          "what we're building and what you do.\"",
        ]),
        pb(),

        // ── SECTION 10: WEEKLY RHYTHM ──
        h1("Section 10 — Your Weekly Operating Rhythm"),
        h2("Monday — Pipeline Review"),
        new Paragraph({ ...bullet("Check melaa.ca/admin for new free signups — call every one") }),
        new Paragraph({ ...bullet("Review outreach pipeline — who needs follow-up?") }),
        new Paragraph({ ...bullet("Send 10 new vendor outreach messages") }),
        new Paragraph({ ...bullet("Check agent logs at melaa.ca/admin/org for any upgrade opportunities flagged") }),
        spacer(),
        h2("Tuesday — Sales Calls"),
        new Paragraph({ ...bullet("Call all warm leads (vendors who showed interest but didn't upgrade)") }),
        new Paragraph({ ...bullet("Send partnership follow-up emails") }),
        new Paragraph({ ...bullet("10 new DMs on Instagram") }),
        spacer(),
        h2("Wednesday — Partnership Building"),
        new Paragraph({ ...bullet("Research and reach out to 3 new potential partners (venues, planners, orgs)") }),
        new Paragraph({ ...bullet("Follow up on any partnership conversations from last week") }),
        new Paragraph({ ...bullet("10 new WhatsApp outreach messages") }),
        spacer(),
        h2("Thursday — Upsell Existing Vendors"),
        new Paragraph({ ...bullet("Check who has been on free for 14+ days — pitch upgrade") }),
        new Paragraph({ ...bullet("Check who on Basic has had 5+ leads — pitch Premium") }),
        new Paragraph({ ...bullet("Send the upgrade script to top candidates") }),
        spacer(),
        h2("Friday — Review & Report"),
        new Paragraph({ ...bullet("Count: how many contacted, how many listed, how many upgraded?") }),
        new Paragraph({ ...bullet("Update tracking spreadsheet") }),
        new Paragraph({ ...bullet("Report to Ishaan: MRR impact, pipeline, wins, blockers") }),
        new Paragraph({ ...bullet("Plan next week's 50-vendor outreach list") }),
        spacer(),
        h2("Weekly Revenue Report to Ishaan (Every Friday)"),
        codeBox([
          "Subject: Weekly Sales Update \u2014 [Date]",
          "",
          "Vendors contacted this week: [#]",
          "New free listings: [#]",
          "New paid upgrades: [#] (total $[amount] added MRR)",
          "Active sales conversations: [#]",
          "Partnership emails sent: [#]",
          "Partnerships in discussion: [describe]",
          "",
          "Biggest win: [describe]",
          "Biggest blocker: [describe]",
          "Top priority next week: [describe]",
        ]),
        pb(),

        // ── SECTION 11: VENDOR UPGRADE SCRIPTS ──
        h1("Section 11 — Converting Free Vendors to Paid"),
        p("The agents flag vendors ready to upgrade. Your job is to close them. These scripts work."),
        spacer(),
        h2("Upgrade Script — Vendor Got Their First Lead"),
        codeBox([
          "[Call them or WhatsApp]",
          "",
          "\"Hey [Name]! Quick update \u2014 I can see [Business Name] just got",
          "a lead through Melaa. Congrats!",
          "",
          "I wanted to reach out because vendors who upgrade to our paid",
          "plan get 3-5x more visibility in search, which usually means",
          "more leads like that one.",
          "",
          "We're still in our founding period so the upgrade is $49/month",
          "instead of $99. Want me to send you the link to upgrade right",
          "now while the rate is still available?\"",
        ]),
        spacer(),
        h2("Upgrade Script — Vendor Has Been Free for 30 Days"),
        codeBox([
          "[WhatsApp or email]",
          "",
          "Hey [Name]! It's been about a month since [Business Name] listed",
          "on Melaa \ud83d\ude4c",
          "",
          "Quick update: couples are searching for [category] in [city]",
          "regularly and your profile is showing up. I wanted to make sure",
          "you know about the Founding Vendor upgrade before the rate closes.",
          "",
          "Right now it's $49/month locked forever (goes to $99/mo once",
          "founding period ends). You'd get:",
          "\u2022 Priority placement in every search",
          "\u2022 Verified badge (couples trust this)",
          "\u2022 Featured placement in category pages",
          "",
          "Upgrade link: melaa.ca/pricing",
          "",
          "Let me know if you have any questions!",
        ]),
        spacer(),
        h2("Annual Plan Pitch — Basic Subscribers (3+ Months)"),
        codeBox([
          "Hey [Name]! You've been a Melaa vendor for [X] months now \ud83c\udf89",
          "",
          "Quick question \u2014 have you had a chance to explore our annual",
          "billing option? It's $890/year instead of $99/month \u2014 basically",
          "2 months free.",
          "",
          "For a platform you're already using, it's an easy win.",
          "",
          "Want me to send you the link?",
        ]),
        pb(),

        // ── SECTION 12: INVESTOR/PRESS ──
        h1("Section 12 — Investor & Press Outreach"),
        h2("When to Start Investor Conversations"),
        p("Start planting seeds now. You are not pitching yet — you are building relationships. The right time to pitch is at $2,000 MRR with clear growth trajectory."),
        spacer(),
        h2("Investors to Research in Canada"),
        new Paragraph({ ...bullet("BDC Capital (Business Development Bank of Canada) — has South Asian founder programs") }),
        new Paragraph({ ...bullet("MaRS Discovery District — Toronto-based startup hub") }),
        new Paragraph({ ...bullet("Communitech — Waterloo Region tech accelerator") }),
        new Paragraph({ ...bullet("Panache Ventures — Canadian early-stage VC") }),
        new Paragraph({ ...bullet("Garage Capital — Toronto seed-stage VC") }),
        new Paragraph({ ...bullet("South Asian angel investors in Toronto/Brampton — search LinkedIn for 'angel investor Brampton'") }),
        spacer(),
        h2("Early Investor LinkedIn Message"),
        codeBox([
          "Hi [Name],",
          "",
          "I'm co-founding Melaa \u2014 we're building the GTA's South Asian",
          "wedding vendor marketplace (melaa.ca). Early traction: $795 MRR,",
          "growing, targeting a $2B+ Canadian market that no one has",
          "properly addressed.",
          "",
          "Not pitching yet \u2014 just building relationships with people who",
          "understand this space. Would love to connect.",
          "",
          "[Your Name]",
        ]),
        spacer(),
        h2("Press/Media Outreach"),
        p("Target these publications for coverage:"),
        new Paragraph({ ...bullet("Toronto Star — South Asian community section") }),
        new Paragraph({ ...bullet("Brampton Guardian") }),
        new Paragraph({ ...bullet("Mississauga News") }),
        new Paragraph({ ...bullet("Desi News Canada (desibulletin.com)") }),
        new Paragraph({ ...bullet("Canadian Immigrant magazine") }),
        new Paragraph({ ...bullet("South Asian wedding blogs: shaadibelles.com, desibridalshow.com") }),
        spacer(),
        h2("Press Pitch Email"),
        codeBox([
          "Subject: A South Asian founder just built something the GTA",
          "community has needed for years",
          "",
          "Hi [Name],",
          "",
          "I thought this might interest your readers:",
          "",
          "A South Asian entrepreneur from the GTA just launched Melaa",
          "(melaa.ca) \u2014 the first wedding vendor marketplace built",
          "exclusively for South Asian weddings in the Greater Toronto Area.",
          "",
          "The story: South Asian couples planning their weddings in Brampton,",
          "Mississauga, and Toronto have had to rely on generic platforms like",
          "WeddingWire \u2014 which are largely built for Western weddings and",
          "don't reflect South Asian traditions, language, or culture.",
          "",
          "Melaa fixes that. Every vendor on the platform is local to the GTA",
          "and understands South Asian weddings from the inside.",
          "",
          "The platform is live, growing, and the founder is available for",
          "a conversation. Would this be a fit for [publication]?",
          "",
          "[Your Name]",
          "Co-Founder, Melaa | melaa.ca",
        ]),
        pb(),

        // ── SECTION 13: KPIs ──
        h1("Section 13 — Metrics & What Success Looks Like"),
        h2("Your Weekly KPI Dashboard"),
        kpiTable([
          ["Outreach messages sent", "20", "80", "200"],
          ["Free vendor signups", "5", "15", "40"],
          ["Paid upgrades", "2", "8", "20"],
          ["MRR added", "$100", "$400", "$1,200"],
          ["Sales calls completed", "5", "20", "60"],
          ["Partnerships pitched", "3", "12", "30"],
          ["Partnerships closed", "0", "2", "8"],
        ]),
        spacer(),
        h2("Revenue Math — Know This"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [4680, 4680],
          rows: [
            ["1 Basic upgrade ($99/mo)", "+$9,504 to company valuation"],
            ["1 Premium upgrade ($249/mo)", "+$23,904 to company valuation"],
            ["5 Basic upgrades/month", "+$47,520 valuation per month"],
            ["1 venue partnership ($300/yr)", "+$2,880 to valuation"],
            ["10 upgrades = MRR $990", "Valuation crosses $100K"],
          ].map(([k, v], i) => new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: k, size: 22, font: "Arial" })] })],
              }),
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 4680, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: v, bold: true, size: 22, font: "Arial", color: ORANGE })] })],
              }),
            ],
          })),
        }),
        pb(),

        // ── SECTION 14: KEY LINKS ──
        h1("Section 14 — Key Links & Access"),
        h2("Platform URLs"),
        new Table({
          width: { size: 9360, type: WidthType.DXA },
          columnWidths: [3600, 5760],
          rows: [
            ["Website", "melaa.ca"],
            ["Vendor signup", "melaa.ca/list-your-business"],
            ["Pricing page", "melaa.ca/pricing"],
            ["Admin dashboard", "melaa.ca/admin (get login from Ishaan)"],
            ["Outreach pipeline", "melaa.ca/admin/outreach"],
            ["Agent monitor", "melaa.ca/admin/org"],
          ].map(([k, v], i) => new TableRow({
            children: [
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 3600, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: k, bold: true, size: 22, font: "Arial" })] })],
              }),
              new TableCell({
                borders,
                shading: { fill: i % 2 === 0 ? GREY_BG : WHITE, type: ShadingType.CLEAR },
                width: { size: 5760, type: WidthType.DXA },
                margins: { top: 100, bottom: 100, left: 180, right: 180 },
                children: [new Paragraph({ children: [new TextRun({ text: v, size: 22, font: "Arial", color: ORANGE })] })],
              }),
            ],
          })),
        }),
        spacer(),
        h2("Contacts"),
        new Paragraph({ ...bullet("Founder/CEO: Ishaan Saini — hello@melaa.ca") }),
        new Paragraph({ ...bullet("Platform email: hello@melaa.ca") }),
        new Paragraph({ ...bullet("Co-Founder #2 (Growth & Community): [Name] — coordinate on vendor content/spotlights") }),
        pb(),

        // ── CLOSING ──
        h1("The Agents Have Your Back"),
        p("While you are doing all of this, here is what is running 24/7 automatically:"),
        spacer(),
        new Paragraph({ ...bullet("Every free vendor who signs up gets a 7-part email nurture sequence automatically (Day 1, 7, 14, 30, 60, 85, 90)") }),
        new Paragraph({ ...bullet("Every vendor who scores high on upgrade likelihood gets flagged automatically for you to follow up") }),
        new Paragraph({ ...bullet("Cold outreach emails are being sent automatically to 20 vendor targets in the pipeline") }),
        new Paragraph({ ...bullet("Revenue is monitored every 30 minutes and any drop or spike is flagged") }),
        new Paragraph({ ...bullet("Weekly financial report is sent to Ishaan every Monday automatically") }),
        new Paragraph({ ...bullet("Market intelligence report runs weekly — competitor pricing, new opportunities") }),
        spacer(),
        p("The agents handle the scale and the automation. You handle the revenue."),
        p("Every dollar of MRR you close increases the company valuation by 8x. A single $99/mo vendor upgrade adds $9,504 to what this company is worth."),
        p("That is the job. Let's build something that makes the community proud."),
        spacer(), spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [new TextRun({ text: "— Ishaan Saini, Founder & CEO", bold: true, size: 24, font: "Arial", color: ORANGE })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "melaa.ca  |  hello@melaa.ca", size: 22, font: "Arial", color: "888888" })],
        }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/ishaansaini/Downloads/mela/Mela_CoFounder3_Sales_Partnerships_Playbook.docx", buffer);
  console.log("Done: Mela_CoFounder3_Sales_Partnerships_Playbook.docx");
});
