import { describe, expect, it } from 'vitest';
import { CHARACTERS, GAMES, GROUPS } from './catalog';
import { createRound, evaluate, isComplete, reduceRound, toRecord, validSelection } from './engine';
import { QUESTIONS, createDeck, questionById, questionsFor } from './questions';
import type { Answer, Question, Round, Selection } from './types';

const selection: Selection = { group: 'letters', game: 'runner', character: 'byte', map: 'forest' };
const solution = (q: Question): Answer =>
  q.type === 'choice'
    ? q.correct
    : q.type === 'order'
      ? [...q.correct]
      : Object.fromEntries(q.pairs.map((p) => [p.id, p.id]));
const current = (round: Round) => questionById.get(round.questionIds[round.index])!;
function complete(round: Round): Round {
  for (let i = round.index; i < 10; i++) {
    round = reduceRound(round, { type: 'submit', answer: solution(current(round)) });
    round = reduceRound(round, { type: 'advance' });
  }
  return round;
}

describe('Bộ học liệu lớp 2', () => {
  it('có 120 bài gốc, 40 bài mỗi nhóm và ID duy nhất', () => {
    expect(QUESTIONS).toHaveLength(120);
    expect(new Set(QUESTIONS.map((q) => q.id)).size).toBe(120);
    for (const group of GROUPS) expect(questionsFor(group.id)).toHaveLength(40);
  });
  it('đáp án chọn duy nhất; chữ và vần ghép lại đúng tiếng đích', () => {
    for (const q of QUESTIONS) {
      expect(q.target).toBe(q.target.normalize('NFC'));
      expect(q.hint.length).toBeGreaterThan(10);
      if (q.type === 'choice') {
        expect(q.options).toHaveLength(3);
        expect(new Set(q.options.map((x) => x.normalize('NFC'))).size).toBe(3);
        expect(q.options.filter((x) => x === q.correct)).toHaveLength(1);
        if (q.id.startsWith('letters-')) expect(q.stem.replace('_', q.correct)).toBe(q.target);
        if (q.id.startsWith('rhyme-')) expect(q.stem.replace(' + ?', q.correct)).toBe(q.target);
        if (q.id.startsWith('word-'))
          expect(q.stem.replace('?', q.correct).replace(' + ', ' ')).toBe(q.target);
      }
      if (q.type === 'order') {
        expect(new Set(q.tokens).size).toBe(q.tokens.length);
        expect(q.correct.join(' ')).toBe(q.target);
      }
      if (q.type === 'match') {
        expect(q.pairs).toHaveLength(4);
        expect(new Set(q.pairs.map((p) => p.picture)).size).toBe(4);
      }
      expect(evaluate(q, solution(q))).toBe(true);
    }
  });
  it('mỗi bộ 10 bài không lặp, không lấy nhầm nhóm và đủ các dạng luyện', () => {
    for (const group of GROUPS) {
      const deck = createDeck(group.id);
      expect(deck).toHaveLength(10);
      expect(new Set(deck).size).toBe(10);
      expect(deck.every((id) => questionById.get(id)?.group === group.id)).toBe(true);
    }
    const words = createDeck('words').map((id) => questionById.get(id)!);
    expect(words.filter((q) => q.type === 'choice')).toHaveLength(4);
    expect(words.filter((q) => q.type === 'order')).toHaveLength(3);
    expect(words.filter((q) => q.type === 'match')).toHaveLength(3);
    const syllables = createDeck('syllables').map((id) => questionById.get(id)!);
    expect(syllables.filter((q) => q.topic === 'Ghép vần')).toHaveLength(5);
  });
});
describe('Luật chơi dùng chung', () => {
  it('không chọn nhầm map giữa các game; đủ 4 game, 10 nhân vật và 23 map', () => {
    expect(GAMES).toHaveLength(4);
    expect(CHARACTERS).toHaveLength(10);
    expect(GAMES.flatMap((g) => g.maps)).toHaveLength(23);
    expect(validSelection({ ...selection, game: 'space', map: 'forest' })).toBe(false);
    expect(() => createRound('student', { ...selection, map: 'missing' })).toThrow();
    for (const game of GAMES)
      for (const map of game.maps)
        for (const character of CHARACTERS)
          expect(validSelection({ ...selection, game: game.id, map: map.id, character: character.id })).toBe(
            true,
          );
  });
  it('chưa làm đủ hoặc đáp án lạ không trừ tim', () => {
    const round = createRound('student', selection);
    expect(round.lives).toBe(3);
    expect(round.score).toBe(0);
    expect(reduceRound(round, { type: 'submit', answer: '' })).toBe(round);
    expect(reduceRound(round, { type: 'submit', answer: 'không có trong bài' })).toBe(round);
    for (const q of QUESTIONS.filter((q) => q.type !== 'choice'))
      expect(isComplete(q, q.type === 'order' ? [] : {})).toBe(false);
  });
  it('sai một lần mất một tim, thử lại đúng được 5 điểm; không cộng/trừ hai lần', () => {
    let round = createRound('student', selection),
      q = current(round);
    if (q.type !== 'choice') throw Error();
    round = reduceRound(round, { type: 'submit', answer: q.options.find((x) => x !== q.correct)! });
    expect(round.phase).toBe('wrong');
    expect(round.lives).toBe(2);
    expect(round.index).toBe(0);
    expect(reduceRound(round, { type: 'submit', answer: q.correct })).toBe(round);
    round = reduceRound(round, { type: 'retry' });
    round = reduceRound(round, { type: 'submit', answer: q.correct });
    expect(round.score).toBe(5);
    expect(round.phase).toBe('correct');
    expect(round.history).toHaveLength(2);
    expect(reduceRound(round, { type: 'submit', answer: q.correct })).toBe(round);
    round = reduceRound(round, { type: 'advance' });
    expect(round.index).toBe(1);
    expect(round.lives).toBe(2);
    round = complete(round);
    expect(round.score).toBe(95);
    expect(round.index).toBe(10);
    expect(round.phase).toBe('completed');
  });
  it('ba lần sai kết thúc lượt ngay, giữ bài và điểm đã hoàn thành', () => {
    let round = createRound('student', selection),
      q = current(round);
    if (q.type !== 'choice') throw Error();
    for (let i = 0; i < 3; i++) {
      round = reduceRound(round, { type: 'submit', answer: q.options.find((x) => x !== q.correct)! });
      if (i < 2) round = reduceRound(round, { type: 'retry' });
    }
    expect(round.phase).toBe('lost');
    expect(round.lives).toBe(0);
    expect(toRecord(round).completed).toBe(0);
    expect(toRecord(round).history).toHaveLength(3);
    expect(reduceRound(round, { type: 'retry' })).toBe(round);
    expect(reduceRound(round, { type: 'advance' })).toBe(round);
  });
  it('làm đủ cả ba dạng của nhóm từ/câu được 100 điểm và chỉ kết thúc sau hoạt ảnh cuối', () => {
    let round = createRound('student', { ...selection, group: 'words' });
    for (let i = 0; i < 10; i++) {
      round = reduceRound(round, { type: 'submit', answer: solution(current(round)) });
      expect(round.phase).toBe('correct');
      if (i === 9) expect(() => toRecord(round)).toThrow();
      round = reduceRound(round, { type: 'advance' });
    }
    expect(toRecord(round)).toMatchObject({ score: 100, completed: 10, lives: 3, outcome: 'completed' });
    expect(reduceRound(round, { type: 'abort' })).toBe(round);
  });
  it('Unicode tiếng Việt dựng sẵn và tổ hợp được nhận như nhau', () => {
    const q = QUESTIONS.find((q) => q.type === 'choice' && q.correct === 'ngủ')!;
    expect(evaluate(q, 'ngủ'.normalize('NFD'))).toBe(true);
  });
  it('nối tranh và xếp câu chỉ chấm khi đủ bài; cặp nối sai vẫn được phát hiện', () => {
    const q = QUESTIONS.find((q) => q.type === 'match')!;
    if (q.type !== 'match') throw Error();
    const right = solution(q) as Record<string, string>;
    expect(evaluate(q, right)).toBe(true);
    const wrong = { ...right, [q.pairs[0].id]: q.pairs[1].id, [q.pairs[1].id]: q.pairs[0].id };
    expect(isComplete(q, wrong)).toBe(true);
    expect(evaluate(q, wrong)).toBe(false);
    expect(isComplete(q, { ...right, [q.pairs[0].id]: q.pairs[1].id })).toBe(false);
    const order = QUESTIONS.find((q) => q.type === 'order')!;
    if (order.type !== 'order') throw Error();
    expect(isComplete(order, [...order.correct].reverse())).toBe(true);
    expect(evaluate(order, [...order.correct].reverse())).toBe(false);
  });
  it('đổi map hoặc nhân vật không đổi điểm, tim và tiến trình', () => {
    for (const game of GAMES)
      for (const map of game.maps) {
        let round = createRound(
          'student',
          { ...selection, game: game.id, map: map.id, character: 'star' },
          () => 0.2,
        );
        const q = current(round);
        if (q.type !== 'choice') throw Error();
        round = reduceRound(round, { type: 'submit', answer: q.options.find((x) => x !== q.correct)! });
        round = reduceRound(round, { type: 'retry' });
        round = complete(round);
        expect(toRecord(round)).toMatchObject({ score: 95, lives: 2, completed: 10, outcome: 'completed' });
      }
  });
  it('dừng giữa chừng giữ kết quả đã làm, không tạo kết quả hoàn thành giả', () => {
    let round = createRound('student', selection);
    for (let i = 0; i < 3; i++) {
      round = reduceRound(round, { type: 'submit', answer: solution(current(round)) });
      round = reduceRound(round, { type: 'advance' });
    }
    round = reduceRound(round, { type: 'abort' });
    expect(toRecord(round)).toMatchObject({ score: 30, completed: 3, outcome: 'abandoned' });
  });
});
