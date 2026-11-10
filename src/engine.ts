import { CHARACTERS, GAMES, GROUPS, gameById } from './catalog';
import { createDeck, questionById } from './questions';
import type { Answer, PlayRecord, Question, Round, Selection } from './types';

const text = (value: string) => value.normalize('NFC').trim();
export function validSelection(selection: unknown): selection is Selection {
  if (!selection || typeof selection !== 'object') return false;
  const s = selection as Selection;
  return (
    GROUPS.some((g) => g.id === s.group) &&
    GAMES.some((g) => g.id === s.game) &&
    CHARACTERS.some((c) => c.id === s.character) &&
    gameById(s.game).maps.some((map) => map.id === s.map)
  );
}
export function isComplete(question: Question, answer: Answer): boolean {
  if (question.type === 'choice')
    return typeof answer === 'string' && question.options.some((option) => text(option) === text(answer));
  if (question.type === 'order') {
    if (!Array.isArray(answer) || answer.length !== question.tokens.length) return false;
    return [...answer].sort().join('\0') === [...question.tokens].sort().join('\0');
  }
  if (!answer || typeof answer !== 'object' || Array.isArray(answer)) return false;
  const ids = question.pairs.map((pair) => pair.id),
    values = Object.values(answer);
  return (
    Object.keys(answer).length === ids.length &&
    ids.every((id) => Object.hasOwn(answer, id)) &&
    values.length === new Set(values).size &&
    values.every((id) => ids.includes(id))
  );
}
export function evaluate(question: Question, answer: Answer): boolean {
  if (!isComplete(question, answer)) return false;
  if (question.type === 'choice') return text(answer as string) === text(question.correct);
  if (question.type === 'order')
    return (answer as string[]).every((token, i) => text(token) === text(question.correct[i]));
  return question.pairs.every((pair) => (answer as Record<string, string>)[pair.id] === pair.id);
}
export function answerLabel(question: Question, answer: Answer): string {
  if (typeof answer === 'string') return answer;
  if (Array.isArray(answer)) return answer.join(' ');
  if (question.type === 'match')
    return question.pairs
      .map((pair) => `${pair.word} → ${question.pairs.find((p) => p.id === answer[pair.id])?.picture || '?'}`)
      .join('; ');
  return '';
}
export function createRound(profileId: string, selection: Selection, random?: () => number): Round {
  if (!profileId || !validSelection(selection))
    throw new Error('Hãy chọn đủ nội dung, game, nhân vật và map.');
  return {
    id: crypto.randomUUID(),
    profileId,
    selection: { ...selection },
    questionIds: createDeck(selection.group, random),
    index: 0,
    score: 0,
    lives: 3,
    phase: 'answer',
    history: [],
    startedAt: new Date().toISOString(),
  };
}
export type RoundAction =
  | { type: 'submit'; answer: Answer; now?: string }
  | { type: 'retry' }
  | { type: 'advance'; now?: string }
  | { type: 'abort'; now?: string };
export const isFinished = (round: Round) => ['completed', 'lost', 'abandoned'].includes(round.phase);
export function reduceRound(round: Round, action: RoundAction): Round {
  if (isFinished(round)) return round;
  if (action.type === 'abort')
    return { ...round, phase: 'abandoned', endedAt: action.now || new Date().toISOString() };
  if (action.type === 'retry') return round.phase === 'wrong' ? { ...round, phase: 'answer' } : round;
  if (action.type === 'advance') {
    if (round.phase !== 'correct') return round;
    const index = round.index + 1;
    return {
      ...round,
      index,
      phase: index === 10 ? 'completed' : 'answer',
      ...(index === 10 ? { endedAt: action.now || new Date().toISOString() } : {}),
    };
  }
  if (round.phase !== 'answer') return round;
  const question = questionById.get(round.questionIds[round.index]);
  if (!question || !isComplete(question, action.answer)) return round;
  const correct = evaluate(question, action.answer),
    at = action.now || new Date().toISOString();
  const hadMistake = round.history.some((attempt) => attempt.questionId === question.id && !attempt.correct);
  const lives = correct ? round.lives : round.lives - 1;
  return {
    ...round,
    lives,
    score: round.score + (correct ? (hadMistake ? 5 : 10) : 0),
    phase: correct ? 'correct' : lives === 0 ? 'lost' : 'wrong',
    history: [
      ...round.history,
      {
        questionId: question.id,
        prompt: question.type === 'choice' ? question.stem : question.prompt,
        target: question.target,
        answer: answerLabel(question, action.answer),
        correct,
        at,
      },
    ],
    ...(lives === 0 ? { endedAt: at } : {}),
  };
}
export function toRecord(round: Round): PlayRecord {
  if (!isFinished(round) || !round.endedAt) throw new Error('Lượt chơi chưa kết thúc.');
  return {
    id: round.id,
    profileId: round.profileId,
    selection: { ...round.selection },
    score: round.score,
    lives: round.lives,
    completed: round.index,
    outcome: round.phase as PlayRecord['outcome'],
    history: [...round.history],
    startedAt: round.startedAt,
    endedAt: round.endedAt,
  };
}
export function accuracy(records: PlayRecord[]): number {
  const attempts = records.flatMap((record) => record.history);
  return attempts.length ? Math.round((100 * attempts.filter((a) => a.correct).length) / attempts.length) : 0;
}
export function practiceItems(records: PlayRecord[]): { target: string; count: number }[] {
  const totals = new Map<string, number>();
  for (const attempt of records.flatMap((r) => r.history))
    if (!attempt.correct) totals.set(attempt.target, (totals.get(attempt.target) || 0) + 1);
  return [...totals].map(([target, count]) => ({ target, count })).sort((a, b) => b.count - a.count);
}
