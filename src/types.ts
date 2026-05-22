export type CharacterId = 'luffy' | 'robin' | 'zoro' | 'hancock';

export type MoodType = 'motivation' | 'demotivation';

export interface Character {
  id: CharacterId;
  name: string;
  avatar: string; // Tailwind bg color + emoji or custom artwork description
  accentColor: string; // Tailwind CSS classes
  textColor: string;
  borderColor: string;
  tagline: string;
  description: string;
  traitTitle: string; // e.g., "Nivel de Nakama"
  traits: string[]; // List of level names
  basePrompt: string;
  gifts: Gift[];
}

export interface Gift {
  id: string;
  name: string;
  emoji: string;
  description: string;
  reactionPrompt: string; // Custom instruction appended to the prompt when gifted
}

export interface GenerationRequest {
  characterId: CharacterId;
  moodType: MoodType;
  situation: string;
  relationshipLevel: number; // 0 to 2
  giftId?: string; // Optional gifted item ID
}

export interface GenerationResponse {
  text: string;
  expression: 'happy' | 'angry' | 'thinking' | 'blushing' | 'dry' | 'dark';
}

export interface LogEntry {
  id: string;
  timestamp: string;
  characterId: CharacterId;
  moodType: MoodType;
  situation: string;
  response: string;
  expression: string;
  relationshipLevelName: string;
  giftName?: string;
}
