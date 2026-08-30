-- ============================================================
-- FINANCIAL DOCTOR (finX) — Expand RAG knowledge base
-- Adds AMFI mutual-fund guidance and additional SEBI/RBI snippets
-- to public.reference_snippets (Tier-1 scam-check retrieval).
-- ============================================================

insert into public.reference_snippets (topic, title, url, snippet) values
-- SEBI
('algo trading unregistered bot signal seller subscription profit',
 'SEBI Circular on Unauthorized Algorithmic Trading & Signal Sellers',
 'https://www.sebi.gov.in/legal/circulars/algo-trading-framework.html',
 'SEBI has flagged unregistered entities selling algorithmic trading bots or paid trading signals with promised win rates. Such offerings are not sanctioned or audited by SEBI and carry no investor protection.'),
('ipo allotment guaranteed listing gain grey market premium scam',
 'SEBI Caution on Fake IPO Allotment & Listing-Gain Guarantees',
 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doPmr=yes',
 'SEBI warns investors against intermediaries promising guaranteed IPO allotment or assured listing-day gains. All IPO allotments are processed via registered registrars using a disclosed, rule-based basis of allotment; no agent can guarantee shares.'),

-- AMFI
('mutual fund guaranteed nav fixed return sip assured scheme',
 'AMFI Guidance: Mutual Funds Are Subject to Market Risk',
 'https://www.amfiindia.com/investor-corner/knowledge-center/mutual-fund-basics.html',
 'AMFI reiterates that mutual fund investments are subject to market risk and NAV can fluctuate based on underlying securities. No mutual fund distributor, registered or otherwise, can guarantee a fixed return or assured NAV appreciation to investors.'),
('unregistered mutual fund distributor commission arn code',
 'AMFI Requirement: ARN Registration for Mutual Fund Distributors',
 'https://www.amfiindia.com/distributor-corner/become-a-mutual-fund-distributor',
 'Any individual or entity distributing or advising on mutual fund products must hold a valid AMFI Registration Number (ARN). Investors should verify a distributor''s ARN status on the AMFI website before investing through them.'),
('fake mutual fund app clone nav fraud portfolio scam',
 'AMFI Advisory on Fraudulent Mutual Fund Apps and Portals',
 'https://www.amfiindia.com/investor-corner/knowledge-center/investor-alerts.html',
 'AMFI has cautioned investors about fraudulent mobile apps and websites mimicking legitimate mutual fund platforms to collect payments outside regulated channels. Transactions should only be made through AMC websites, RTAs (CAMS/KFintech), or ARN-verified distributors.'),
('smart sip high return scheme exclusive mutual fund plan',
 'AMFI Clarification on ''Exclusive'' or ''High-Return'' SIP Plans',
 'https://www.amfiindia.com/investor-corner',
 'There is no such thing as an ''exclusive'' or ''special access'' mutual fund SIP plan offering above-market guaranteed returns. All mutual fund schemes and their scheme information documents (SID) are publicly available and identical for every investor.'),

-- RBI
('unlicensed nbfc deposit scheme fixed interest chit fund',
 'RBI Alert on Unauthorized Deposit-Taking Entities',
 'https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=unauthorized-deposits',
 'RBI advises the public to deal only with NBFCs and deposit-taking institutions that appear on its official list of registered entities. Unlicensed entities offering fixed high-interest deposit schemes are operating illegally and offer no depositor protection.'),
('instant loan app harassment predatory lending digital lending fraud',
 'RBI Guidelines on Digital Lending and Loan App Fraud',
 'https://www.rbi.org.in/Scripts/NotificationUser.aspx?Id=digital-lending-guidelines',
 'RBI''s digital lending guidelines require all loans to be disbursed and serviced only by RBI-regulated entities or their registered lending service providers. Apps that bypass this framework, charge undisclosed fees, or use coercive recovery tactics are unauthorized and should be reported.'),
('forex trading binary options unregistered broker guaranteed profit',
 'RBI Caution on Unauthorized Forex Trading Platforms',
 'https://www.rbi.org.in/scripts/BS_PressReleaseDisplay.aspx?prid=forex-trading-caution',
 'RBI has repeatedly cautioned that online forex trading platforms and mobile apps offering trading in currency pairs outside authorized exchanges (NSE/BSE/MCX-SX) are illegal under FEMA. Guaranteed-profit forex or binary-options schemes are a common fraud vector.')
on conflict do nothing;
