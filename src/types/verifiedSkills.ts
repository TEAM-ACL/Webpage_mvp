// ACL: VisionTech verified skill types

export type SkillVerificationLevel =
  | "unverified"
  | "emerging"
  | "verified"
  | "strongly_verified";

export interface SkillEvidence {
  id: string;
  type:
    | "project"
    | "learning"
    | "certificate"
    | "github"
    | "collaboration"
    | "manual";
  title: string;
}

export interface VerifiedSkill {
  id: string;
  skill_name: string;
  verification_level: SkillVerificationLevel;
  confidence_score: number;
  evidence_summary: string;
  evidence: SkillEvidence[];
}

