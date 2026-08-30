// One-off seeding script for the expanded RAG knowledge base (SEBI/AMFI/RBI).
// Run with: node scripts/seed-reference-snippets.mjs
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";0

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
const envText = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envText.split(/\r?\n/)) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2];
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const rows = [
  // SEBI
  {
    topic: "algo trading unregistered bot signal seller subscription profit",
    title: "SEBI Circular on Unauthorized Algorithmic Trading & Signal Sellers",
    url: "https://www.sebi.gov.in/legal/circulars/algo-trading-framework.html",
    snippet:
      "SEBI has flagged unregistered entities selling algorithmic trading bots or paid trading signals with promised win rates. Such offerings are not sanctioned or audited by SEBI and carry no investor protection.",
  },
  {
    topic: "ipo allotment guaranteed listing gain grey market premium scam",
    title: "SEBI Caution on Fake IPO Allotment & Listing-Gain Guarantees",
    url: "https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doPmr=yes",
    snippet:
      "SEBI warns investors against intermediaries promising guaranteed IPO allotment or assured listing-day gains. All IPO allotments are processed via registered registrars using a disclosed, rule-based basis of allotment; no agent can guarantee shares.",
  },
  // AMFI
  {
    topic: "mutual fund guaranteed nav fixed return sip assured scheme",
    title: "AMFI Guidance: Mutual Funds Are Subject to Market Risk",
    url: "https://www.amfiindia.com/investor-corner/knowledge-center/mutual-fund-basics.html",
    snippet:
      "AMFI reiterates that mutual fund investments are subject to market risk and NAV can fluctuate based on underlying securities. No mutual fund distributor, registered or otherwise, can guarantee a fixed return or assured NAV appreciation to investors.",
  },
  {
    topic: "unregistered mutual fund distributor commission arn code",
    title: "AMFI Requirement: ARN Registration for Mutual Fund Distributors",
    url: "https://www.amfiindia.com/distributor-corner/become-a-mutual-fund-distributor",
    snippet:
      "Any individual or entity distributing or advising on mutual fund products must hold a valid AMFI Registration Number (ARN). Investors should verify a distributor's ARN status on the AMFI website before investing through them.",
  },
  {
    topic: "fake mutual fund app clone nav fraud portfolio scam",
    title: "AMFI Advisory on Fraudulent Mutual Fund Apps and Portals",
    url: "https://www.amfiindia.com/investor-corner/knowledge-center/investor-alerts.html",
    snippet:
      "AMFI has cautioned investors about fraudulent mobile apps and websites mimicking legitimate mutual fund platforms to collect payments outside regulated channels. Transactions should only be made through AMC websites, RTAs (CAMS/KFintech), or ARN-verified distributors.",
  },
  {
    topic: "smart sip high return scheme exclusive mutual fund plan",
    title: "AMFI Clarification on 'Exclusive' or 'High-Return' SIP Plans",
    url: "https://www.amfiindia.com/investor-corner",
    snippet:
      "There is no such thing as an 'exclusive' or 'special access' mutual fund SIP plan offering above-market guaranteed returns. All mutual fund schemes and their scheme information documents (SID) are publicly available and identical for every investor.",
  },
  // RBI
  {
    topic: "unlicensed nbfc deposit scheme fixed interest chit fund",
    title: "RBI Alert on Unauthorized Deposit-Taking Entities",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=unauthorized-deposits",
    snippet:
      "RBI advises the public to deal only with NBFCs and deposit-taking institutions that appear on its official list of registered entities. Unlicensed entities offering fixed high-interest deposit schemes are operating illegally and offer no depositor protection.",
  },
  {
    topic: "instant loan app harassment predatory lending digital lending fraud",
    title: "RBI Guidelines on Digital Lending and Loan App Fraud",
    url: "https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=digital-lending-guidelines",
    snippet:
      "RBI's digital lending guidelines require all loans to be disbursed and serviced only by RBI-regulated entities or their registered lending service providers. Apps that bypass this framework, charge undisclosed fees, or use coercive recovery tactics are unauthorized and should be reported.",
  },
  {
    topic: "forex trading binary options unregistered broker guaranteed profit",
    title: "RBI Caution on Unauthorized Forex Trading Platforms",
    url: "https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=forex-trading-caution",
    snippet:
      "RBI has repeatedly cautioned that online forex trading platforms and mobile apps offering trading in currency pairs outside authorized exchanges (NSE/BSE/MCX-SX) are illegal under FEMA. Guaranteed-profit forex or binary-options schemes are a common fraud vector.",
  },
];

const { data: existing, error: fetchErr } = await supabase
  .from("reference_snippets")
  .select("url");

if (fetchErr) {
  console.error("Failed to fetch existing snippets:", fetchErr.message);
  process.exit(1);
}

const existingUrls = new Set((existing || []).map((r) => r.url));
const toInsert = rows.filter((r) => !existingUrls.has(r.url));

if (toInsert.length === 0) {
  console.log("All snippets already present. Nothing to insert.");
  process.exit(0);
}

const { data, error } = await supabase.from("reference_snippets").insert(toInsert).select();

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}

console.log(`Inserted ${data.length} new reference_snippets rows.`);
