export type RequirementType = "mandatory" | "recommendation";
export type MappingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "missing"
  | "weak"
  | "ambiguous";

export interface Mapping {
  id: string;
  requirementId: string;
  requirementText: string;
  type: RequirementType;
  sourceCitation: string;
  status: MappingStatus;
  confidence: number;
  evidenceQuote: string | null;
  aiReasoning: string;
  userNotes?: string;
}

export interface Assessment {
  id: string;
  title: string;
  status: "draft" | "in-review" | "completed";
  completeness: number;
  updatedAt: string;
  createdAt: string;
  guidelineName: string;
  applicationName: string;
  mappings: Mapping[];
  clarifications: string[];
  isStale: boolean;
}

export interface StoredDocument {
  id: string;
  name: string;
  type: "guideline" | "application" | "supporting";
  size: number;
  uploadedAt: string;
  content: string;
  tags: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  guidelineText: string;
  guidelineName: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  assessments: Assessment[];
  documents: StoredDocument[];
  templates: Template[];
  currentId: string | null;

  addAssessment: (a: Assessment) => void;
  updateAssessment: (id: string, patch: Partial<Assessment>) => void;
  deleteAssessment: (id: string) => void;
  setCurrent: (id: string | null) => void;

  addDocument: (d: StoredDocument) => void;
  updateDocument: (id: string, patch: Partial<StoredDocument>) => void;
  deleteDocument: (id: string) => void;

  addTemplate: (t: Template) => void;
  updateTemplate: (id: string, patch: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
}