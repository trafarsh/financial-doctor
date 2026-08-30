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
      primaryCrops: ["mango"],
      requiredDistricts: ["krishnagiri", "salem", "dharmapuri", "vellore"],
      maxLandHa: 4.0,
    },
  },
  {
    id: "SCH-JDYINS",
    name: "PM Jan Dhan Yojana Accidental Insurance Cover",
    agency: "Central Government",
    benefitDescription: "Free accidental insurance cover up to ₹2 Lakhs linked to a basic RuPay debit card and JDY zero-balance account.",
    estimatedBenefitAmount: 2000, // estimated implicit insurance value
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
    estimatedBenefitAmount: 8000, // illustrative coverage yield value
    requiredDocuments: ["Land Record (Patta/Sowing Certificate)", "Bank Passbook Copy", "Sowing Certificate from VAO"],
    lastVerified: "2026-08-01",
    sourceUrl: "https://pmfby.gov.in",
    eligibilityRules: {
      primaryCrops: ["mango", "ragi", "rice", "cotton", "sugarcane", "maize"],
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

      // 1. Max Land Check
      if (rules.maxLandHa !== undefined) {
        if (profile.landHoldingHa <= rules.maxLandHa) {
          matchingCriteria.push(`Land holding ${profile.landHoldingHa} ha is below maximum allowed ${rules.maxLandHa} ha`);
        } else {
          failingCriteria.push(`Land holding ${profile.landHoldingHa} ha exceeds maximum allowed ${rules.maxLandHa} ha`);
        }
      }

      // 2. Min Land Check
      if (rules.minLandHa !== undefined) {
        if (profile.landHoldingHa >= rules.minLandHa) {
          matchingCriteria.push(`Land holding ${profile.landHoldingHa} ha is above minimum required ${rules.minLandHa} ha`);
        } else {
          failingCriteria.push(`Land holding ${profile.landHoldingHa} ha is below minimum required ${rules.minLandHa} ha`);
        }
      }

      // 3. Max Income Check
      if (rules.maxIncome !== undefined) {
        if (profile.annualIncome <= rules.maxIncome) {
          matchingCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString("en-IN")} is within limit of ₹${rules.maxIncome.toLocaleString("en-IN")}`);
        } else {
          failingCriteria.push(`Annual income ₹${profile.annualIncome.toLocaleString("en-IN")} exceeds limit of ₹${rules.maxIncome.toLocaleString("en-IN")}`);
        }
      }

      // 4. Social Categories Check
      if (rules.socialCategories !== undefined) {
        const catMatch = rules.socialCategories.includes(profile.socialCategory);
        if (catMatch) {
          matchingCriteria.push(`Social category ${profile.socialCategory} is eligible`);
        } else {
          failingCriteria.push(`Social category ${profile.socialCategory} is not listed in eligible categories (${rules.socialCategories.join(", ")})`);
        }
      }

      // 5. Primary Crops Check
      if (rules.primaryCrops !== undefined) {
        const cropMatch = rules.primaryCrops.map((c) => c.toLowerCase()).includes(profile.primaryCrop.toLowerCase());
        if (cropMatch) {
          matchingCriteria.push(`Primary crop "${profile.primaryCrop}" is eligible`);
        } else {
          failingCriteria.push(`Primary crop "${profile.primaryCrop}" is not eligible (supported crops: ${rules.primaryCrops.join(", ")})`);
        }
      }

      // 6. Requires No KCC Check
      if (rules.requiresNoKcc !== undefined && rules.requiresNoKcc) {
        if (!profile.existingKcc) {
          matchingCriteria.push(`Household does not hold an existing Kisan Credit Card`);
        } else {
          failingCriteria.push(`Household already holds a Kisan Credit Card`);
        }
      }

      // 7. Required Districts Check
      if (rules.requiredDistricts !== undefined) {
        const distMatch = rules.requiredDistricts.map((d) => d.toLowerCase()).includes(profile.district.toLowerCase());
        if (distMatch) {
          matchingCriteria.push(`District "${profile.district}" is in the eligible regions`);
        } else {
          failingCriteria.push(`District "${profile.district}" is outside the supported regions (${rules.requiredDistricts.join(", ")})`);
        }
      }

      // If there are no failing criteria, then eligible!
      const isEligible = failingCriteria.length === 0;

      return {
        scheme,
        isEligible,
        matchingCriteria,
        failingCriteria,
      };
    }).sort((a, b) => {
      // Sort eligible schemes first, then by estimated benefit amount descending
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
- Instruct the user to consult their local village administrative officer (VAO), panchayat office, or bank branch to verify eligibility and make submissions.
- Strictly emphasize that this is for educational informational purposes and not a legal or official guarantee of funding.
- Output JSON: { "explanation": string }
`;

    const userPrompt = `
HOUSEHOLD PROFILE:
- District: ${profile.district}
- Land Holding: ${profile.landHoldingHa} Hectares
- Primary Crop: ${profile.primaryCrop}
- Annual Income: ₹${profile.annualIncome.toLocaleString("en-IN")}
- Social Category: ${profile.socialCategory}
- Existing KCC: ${profile.existingKcc ? "Yes" : "No"}

ELIGIBLE SCHEMES COUNT: ${eligibleCount}
INELIGIBLE SCHEMES COUNT: ${matches.length - eligibleCount}
`;

    const fallbackExplanation = `Based on your profile, you are eligible for ${eligibleCount} out of ${matches.length} evaluated schemes${
      eligibleCount > 0 ? ` (including ${eligibleSchemeNames})` : ""
    }. Please download the document checklists and consult your local panchayat secretary or bank officer to verify the official rules. This dashboard provides educational analysis and is not an official guarantee of acceptance.`;

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
