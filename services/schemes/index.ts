// ============================================================
// FINANCIAL DOCTOR (finX) — Government Scheme Eligibility Service
// Deterministic matching logic + AI non-advisory description
// ============================================================

import { GovernmentScheme, HouseholdProfile, SchemeMatchResult } from "@/lib/types";
import { callLLM } from "@/lib/openrouter";
import { schemeEvaluationLLMResponseSchema } from "@/lib/validation";
import { APP_CONFIG } from "@/lib/config";

export const CURATED_SCHEMES: GovernmentScheme[] = [
  {
    id: "SCH-PMKISAN",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    agency: "Central Government",
    benefitDescription: "₹6,000 per year in three equal installments of ₹2,000 direct to bank account.",
    estimatedBenefitAmount: 6000,
    requiredDocuments: ["Aadhaar Card", "Land Ownership Record (Patta/Chitta)", "Active Bank Account"],
    lastVerified: "2026-08-01",
    sourceUrl: "https://pmkisan.gov.in",
    eligibilityRules: {
      maxLandHa: 2.0,
      maxIncome: 200000,
    },
  },
  {
    id: "SCH-KCC",
    name: "Kisan Credit Card (KCC) Crop Loan",
    agency: "Central Government / NABARD",
    benefitDescription: "Short-term credit up to ₹3 Lakhs for cultivation expenses at interest rates as low as 4% (with prompt repayment).",
    estimatedBenefitAmount: 12000, // illustrative annual interest savings on ₹1 Lakh loan vs informal rates
    requiredDocuments: ["Land Patta/Chitta Copy", "Identity Proof (Aadhaar/Voter ID)", "Affidavit of No Dues from other Banks"],
    lastVerified: "2026-07-15",
    sourceUrl: "https://www.nabard.org",
    eligibilityRules: {
      requiresNoKcc: true,
    },
  },
  {
    id: "SCH-MUDRA",
    name: "PM MUDRA Yojana (Shishu Loan)",
    agency: "Central Government / SIDBI",
    benefitDescription: "Collateral-free business loans up to ₹50,000 for setting up non-farm activities like dairy, poultry, or retail shops.",
    estimatedBenefitAmount: 5000,
    requiredDocuments: ["MUDRA Loan Application Form", "ID Proof", "Address Proof", "Business Proposal Details"],
    lastVerified: "2026-06-30",
    sourceUrl: "https://www.mudra.org.in",
    eligibilityRules: {
      maxIncome: 500000,
    },
  },
  {
    id: "SCH-TNMANGO",
    name: "Tamil Nadu Mango Cultivation Promotion Subsidy",
    agency: "Tamil Nadu State Government",
    benefitDescription: "Subsidized high-yielding mango saplings, drip irrigation setup support, and micro-nutrient packs worth up to ₹20,000 per hectare.",
    estimatedBenefitAmount: 20000,
    requiredDocuments: ["Aadhaar Card", "Land Patta/Chitta", "Adangal Certificate from VAO (Village Administrative Officer)", "Soil testing report"],
    lastVerified: "2026-08-10",
    sourceUrl: "https://www.tnhorticulture.tn.gov.in",
    eligibilityRules: {
      requiredState: "Tamil Nadu",
      primaryCrops: ["mango"],
      maxLandHa: 4.0,
    },
  },
  {
    id: "SCH-RYTHUBANDHU",
    name: "Rythu Bandhu Investment Support",
    agency: "Telangana State Government",
    benefitDescription: "Financial assistance of ₹10,000 per acre per year direct to bank account for purchasing farm inputs (seeds, fertilizers).",
    estimatedBenefitAmount: 25000, // estimated for 2.5 acres
    requiredDocuments: ["Aadhaar Card", "Pattadar Passbook (Rythu Bandhu Card)", "Bank Account Link Passbook"],
    lastVerified: "2026-07-25",
    sourceUrl: "http://rythubandhu.telangana.gov.in",
    eligibilityRules: {
      requiredState: "Telangana",
      maxLandHa: 10.0,
    },
  },
  {
    id: "SCH-KALIA",
    name: "KALIA Livelihood Support Scheme",
    agency: "Odisha State Government",
    benefitDescription: "Financial support of ₹10,000 per family per year for buying farming seeds, fertilizers, and pesticides.",
    estimatedBenefitAmount: 10000,
    requiredDocuments: ["Aadhaar Card", "Land Record Copy", "Income Certificate", "Active Bank Passbook"],
    lastVerified: "2026-08-01",
    sourceUrl: "https://kalia.odisha.gov.in",
    eligibilityRules: {
      requiredState: "Odisha",
      maxLandHa: 2.0,
      maxIncome: 150000,
    },
  },
  {
    id: "SCH-RYTHUBHAROSA",
    name: "YSR Rythu Bharosa Support",
    agency: "Andhra Pradesh State Government",
    benefitDescription: "Investment support of ₹13,500 per year (combined with PM-KISAN) for landowning and tenant farming families.",
    estimatedBenefitAmount: 13500,
    requiredDocuments: ["Rythu Bharosa Card", "Land Patta or Tenant Cultivation Agreement", "Aadhaar Card", "Bank Account"],
    lastVerified: "2026-08-12",
    sourceUrl: "https://ysrrythubharosa.ap.gov.in",
    eligibilityRules: {
      requiredState: "Andhra Pradesh",
      maxLandHa: 3.0,
    },
  },
  {
    id: "SCH-MJPSKLW",
    name: "Mahatma Jyotirao Phule Crop Loan Waiver Scheme",
    agency: "Maharashtra State Government",
    benefitDescription: "Crop loan waiver up to ₹2,00,000 for distressed farmers holding outstanding loan accounts in cooperative/public banks.",
    estimatedBenefitAmount: 150000, // typical waiver benefit scale
    requiredDocuments: ["KCC Loan Passbook", "Outstanding Loan Account statement", "Aadhaar Card", "Cooperative Bank certificate"],
    lastVerified: "2026-06-15",
    sourceUrl: "https://mjpsky.maharashtra.gov.in",
    eligibilityRules: {
      requiredState: "Maharashtra",
      requiresKcc: true,
    },
  },
  {
    id: "SCH-CRMSUBSIDY",
    name: "Crop Residue Management (CRM) Subsidy",
    agency: "Punjab State Government / Central Govt",
    benefitDescription: "50% to 80% capital subsidy on buying residue management machinery (Happy Seeder, Mulcher, Smart Seeder) to prevent stubble burning.",
    estimatedBenefitAmount: 45000, // average machinery subsidy savings
    requiredDocuments: ["Aadhaar/PAN card", "Land ownership proof", "Machinery Proforma Invoice", "Agriculture Department Approval Letter"],
    lastVerified: "2026-08-20",
    sourceUrl: "https://agri.punjab.gov.in",
    eligibilityRules: {
      requiredState: "Punjab",
      primaryCrops: ["wheat", "rice"],
    },
  },
  {
    id: "SCH-JDYINS",
    name: "PM Jan Dhan Yojana Accidental Insurance Cover",
    agency: "Central Government",
    benefitDescription: "Free accidental insurance cover up to ₹2 Lakhs linked to a basic RuPay debit card and JDY zero-balance account.",
    estimatedBenefitAmount: 2000,
    requiredDocuments: ["Aadhaar Card", "Voter ID or NREGA Job Card", "RuPay Card details"],
    lastVerified: "2026-05-01",
    sourceUrl: "https://www.pmjdy.gov.in",
    eligibilityRules: {
      maxIncome: 150000,
    },
  },
  {
    id: "SCH-PMFBY",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    agency: "Central Government",
    benefitDescription: "Low-premium crop insurance protecting against crop loss due to drought, monsoon failure, pests, or disease.",
    estimatedBenefitAmount: 8000,
    requiredDocuments: ["Land Record (Patta/Sowing Certificate)", "Bank Passbook Copy", "Sowing Certificate from VAO"],
    lastVerified: "2026-08-01",
    sourceUrl: "https://pmfby.gov.in",
    eligibilityRules: {
      primaryCrops: ["mango", "ragi", "rice", "cotton", "sugarcane", "maize", "wheat"],
    },
  },
];

export class SchemesService {
  /** Deterministic matching logic evaluating eligibility rules */
  evaluateSchemes(profile: HouseholdProfile): SchemeMatchResult[] {
    return CURATED_SCHEMES.map((scheme) => {
      const matchingCriteria: string[] = [];
      const failingCriteria: string[] = [];
      const rules = scheme.eligibilityRules;

      // 1. Required State Check
      if (rules.requiredState !== undefined) {
        if ((profile.state || "").toLowerCase() === rules.requiredState.toLowerCase()) {
          matchingCriteria.push(`State is "${profile.state}" (matches required ${rules.requiredState})`);
        } else {
          failingCriteria.push(`State is "${profile.state}" (requires "${rules.requiredState}")`);
        }
      }

      // 2. Requires KCC Check
      if (rules.requiresKcc !== undefined && rules.requiresKcc) {
        if (profile.existingKcc) {
          matchingCriteria.push(`Household holds an active Kisan Credit Card (KCC)`);
        } else {
          failingCriteria.push(`Household does not hold a Kisan Credit Card (KCC)`);
        }
      }

      // 3. Max Land Check
      if (rules.maxLandHa !== undefined) {
        if (profile.landHoldingHa <= rules.maxLandHa) {
          matchingCriteria.push(`Land holding ${profile.landHoldingHa} ha is within maximum limit of ${rules.maxLandHa} ha`);
        } else {
          failingCriteria.push(`Land holding ${profile.landHoldingHa} ha exceeds maximum allowed ${rules.maxLandHa} ha`);
        }
      }

      // 4. Min Land Check
      if (rules.minLandHa !== undefined) {
        if (profile.landHoldingHa >= rules.minLandHa) {
          matchingCriteria.push(`Land holding ${profile.landHoldingHa} ha is above minimum required ${rules.minLandHa} ha`);
        } else {
          failingCriteria.push(`Land holding ${profile.landHoldingHa} ha is below minimum required ${rules.minLandHa} ha`);
        }
      }

      // 5. Max Income Check
      if (rules.maxIncome !== undefined) {
        if (profile.annualIncome <= rules.maxIncome) {
          matchingCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString("en-IN")} is within limit of ₹${rules.maxIncome.toLocaleString("en-IN")}`);
        } else {
          failingCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString("en-IN")} exceeds limit of ₹${rules.maxIncome.toLocaleString("en-IN")}`);
        }
      }

      // 6. Social Categories Check
      if (rules.socialCategories !== undefined) {
        const catMatch = rules.socialCategories.includes(profile.socialCategory);
        if (catMatch) {
          matchingCriteria.push(`Social category ${profile.socialCategory} is eligible`);
        } else {
          failingCriteria.push(`Social category ${profile.socialCategory} is not listed in eligible categories (${rules.socialCategories.join(", ")})`);
        }
      }

      // 7. Primary Crops Check
      if (rules.primaryCrops !== undefined) {
        const cropMatch = rules.primaryCrops.map((c) => c.toLowerCase()).includes(profile.primaryCrop.toLowerCase());
        if (cropMatch) {
          matchingCriteria.push(`Primary crop "${profile.primaryCrop}" is eligible`);
        } else {
          failingCriteria.push(`Primary crop "${profile.primaryCrop}" is not eligible (supported crops: ${rules.primaryCrops.join(", ")})`);
        }
      }

      // 8. Requires No KCC Check
      if (rules.requiresNoKcc !== undefined && rules.requiresNoKcc) {
        if (!profile.existingKcc) {
          matchingCriteria.push(`Household does not hold an existing Kisan Credit Card`);
        } else {
          failingCriteria.push(`Household already holds a Kisan Credit Card`);
        }
      }

      // 9. Required Districts Check
      if (rules.requiredDistricts !== undefined) {
        const distMatch = rules.requiredDistricts.map((d) => d.toLowerCase()).includes(profile.district.toLowerCase());
        if (distMatch) {
          matchingCriteria.push(`District "${profile.district}" is in the eligible regions`);
        } else {
          failingCriteria.push(`District "${profile.district}" is outside the supported regions (${rules.requiredDistricts.join(", ")})`);
        }
      }

      const isEligible = failingCriteria.length === 0;

      return {
        scheme,
        isEligible,
        matchingCriteria,
        failingCriteria,
      };
    }).sort((a, b) => {
      if (a.isEligible && !b.isEligible) return -1;
      if (!a.isEligible && b.isEligible) return 1;
      return b.scheme.estimatedBenefitAmount - a.scheme.estimatedBenefitAmount;
    });
  }

  /** Call AI to draft plain language guidance summaries */
  async generateExplanation(
    userId: string,
    profile: HouseholdProfile,
    matches: SchemeMatchResult[]
  ): Promise<string> {
    const eligibleCount = matches.filter((m) => m.isEligible).length;
    const eligibleSchemeNames = matches
      .filter((m) => m.isEligible)
      .map((m) => m.scheme.name)
      .join(", ");

    const systemPrompt = `
You are finX, an educational decision support system. Draft a 3-sentence summary of the user's government scheme eligibility.
Rules:
- State clearly how many schemes the user eligible for (${eligibleCount} out of ${matches.length} analyzed schemes).
- Mention key eligible schemes (such as: ${eligibleSchemeNames || "None"}).
- Instruct the user to consult their local village administrative officer (VAO), Panchayat, Krishi Vigyan Kendra, or bank branch to verify eligibility.
- Strictly emphasize that this is for educational informational purposes and not a legal or official guarantee of funding.
- Output JSON: { "explanation": string }
`;

    const userPrompt = `
HOUSEHOLD PROFILE:
- State: ${profile.state}
- District: ${profile.district}
- Land Holding: ${profile.landHoldingHa} Hectares
- Primary Crop: ${profile.primaryCrop}
- Annual Income: ₹${profile.annualIncome.toLocaleString("en-IN")}
- Social Category: ${profile.socialCategory}
- Existing KCC: ${profile.existingKcc ? "Yes" : "No"}

ELIGIBLE SCHEMES COUNT: ${eligibleCount}
INELIGIBLE SCHEMES COUNT: ${matches.length - eligibleCount}
`;

    const fallbackExplanation = `Based on your profile in ${profile.district}, ${profile.state}, you are eligible for ${eligibleCount} out of ${matches.length} evaluated schemes${
      eligibleCount > 0 ? ` (including ${eligibleSchemeNames})` : ""
    }. Please download the document checklists and consult your local village officer or bank representative. This dashboard provides educational analysis and is not an official guarantee of acceptance.`;

    try {
      const { data } = await callLLM<{ explanation: string }>({
        systemPrompt,
        userPrompt,
        schema: schemeEvaluationLLMResponseSchema,
        route: "/api/schemes",
        userId,
        fallbackData: { explanation: fallbackExplanation },
      });

      return `${data.explanation}\n\n*${APP_CONFIG.disclaimer.persistent}*`;
    } catch {
      return `${fallbackExplanation}\n\n*${APP_CONFIG.disclaimer.persistent}*`;
    }
  }
}

export const schemesService = new SchemesService();
