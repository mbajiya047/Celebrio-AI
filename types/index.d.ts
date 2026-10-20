/**
 * @fileoverview Type Definitions for Celebrio AI Planning Architecture
 */

export interface ColorSwatch {
  name: string;
  hex: string;
  usage?: string;
}

export interface SignatureDrink {
  name: string;
  recipe: string;
  mocktailAlternative?: string;
}

export interface ThemeConcept {
  conceptName: string;
  description: string;
  colorPalette: ColorSwatch[];
  decorHighlights: string[];
  signatureDrink: SignatureDrink;
  musicVibe: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent?: number;
  percentage?: number;
  notes?: string;
  savingTip?: string;
}

export interface TimelineMilestone {
  id: string;
  timeframe: string;
  phase: string;
  task: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  done: boolean;
}

export interface RunOfShowCue {
  time: string;
  activity: string;
  lead: string;
  location?: string;
  notes?: string;
}

export interface VendorPartner {
  id: string;
  category: string;
  name?: string;
  role: string;
  estimatedCost: number;
  actualCost?: number;
  status: 'Researching' | 'Inquired' | 'Contacted' | 'Contracted' | 'Paid';
  contact?: string;
  keyQuestions?: string;
  priority?: string;
}

export interface EventSummary {
  title: string;
  tagline?: string;
  eventType: 'wedding' | 'birthday' | 'community' | 'corporate' | 'anniversary' | 'shower';
  eventDate?: string;
  location?: string;
  guestCount: number;
  budgetTotal: number;
  currency: string;
  aesthetic?: string;
  keyVision?: string;
}

export interface EventPlan {
  id: string;
  summary: EventSummary;
  theme: ThemeConcept;
  budget: {
    total: number;
    categories: BudgetCategory[];
  };
  timelineMilestones: TimelineMilestone[];
  runOfShow: RunOfShowCue[];
  vendors: VendorPartner[];
  personalizedIdeas: {
    signatureActivities: Array<{ title: string; description: string; supplies?: string }>;
    invitationCopy: {
      headline: string;
      opening: string;
      details: string;
      rsvpNote: string;
      dressCodeAdvice?: string;
    };
    guestExperienceTouch?: string;
  };
}
