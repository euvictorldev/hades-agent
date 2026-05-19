export interface SkillMetadata {
  name: string;
  description: string;
  version: number;
  created: string;
  last_used: string;
  use_count: number;
  success_rate: number;
}

export interface Skill {
  metadata: SkillMetadata;
  content: string; // The markdown content / procedure
}
