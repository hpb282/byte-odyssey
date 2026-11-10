export type GroupId = 'letters' | 'syllables' | 'words';
export type GameId = 'runner' | 'space' | 'race' | 'climb';
export type CharacterId =
  'mascot' | 'byte' | 'cat' | 'rabbit' | 'bear' | 'fox' | 'frog' | 'penguin' | 'sprout' | 'star';
export interface Selection {
  group: GroupId;
  game: GameId;
  character: CharacterId;
  map: string;
}
export interface Profile {
  id: string;
  name: string;
  classroom: string;
  createdAt: string;
}
export interface Settings {
  sound: boolean;
  reducedMotion: boolean;
}
interface QuestionBase {
  id: string;
  group: GroupId;
  prompt: string;
  target: string;
  hint: string;
  illustration?: string;
  topic: string;
}
export interface ChoiceQuestion extends QuestionBase {
  type: 'choice';
  stem: string;
  options: string[];
  correct: string;
}
export interface OrderQuestion extends QuestionBase {
  type: 'order';
  tokens: string[];
  correct: string[];
}
export interface MatchQuestion extends QuestionBase {
  type: 'match';
  pairs: { id: string; word: string; picture: string }[];
}
export type Question = ChoiceQuestion | OrderQuestion | MatchQuestion;
export type Answer = string | string[] | Record<string, string>;
export interface Attempt {
  questionId: string;
  prompt: string;
  target: string;
  answer: string;
  correct: boolean;
  at: string;
}
export type Phase = 'answer' | 'wrong' | 'correct' | 'completed' | 'lost' | 'abandoned';
export interface Round {
  id: string;
  profileId: string;
  selection: Selection;
  questionIds: string[];
  index: number;
  score: number;
  lives: number;
  phase: Phase;
  history: Attempt[];
  startedAt: string;
  endedAt?: string;
}
export interface PlayRecord {
  id: string;
  profileId: string;
  selection: Selection;
  score: number;
  lives: number;
  completed: number;
  outcome: 'completed' | 'lost' | 'abandoned';
  history: Attempt[];
  startedAt: string;
  endedAt: string;
}
export interface SaveData {
  version: 1;
  profiles: Profile[];
  records: PlayRecord[];
  selectedProfileId: string | null;
  settings: Settings;
}
