import { useEffect, useMemo, useState } from 'react';
import { isComplete } from '../engine';
import { shuffled } from '../questions';
import type { Answer, Phase, Question } from '../types';

function randomFor(value: string) {
  let seed = 2166136261;
  for (const char of value) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619);
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) | 0;
    return (seed >>> 0) / 4294967296;
  };
}
export function QuestionPanel({
  question,
  roundId,
  phase,
  action,
  disabled,
  onSubmit,
  onRetry,
}: {
  question: Question;
  roundId: string;
  phase: Phase;
  action: string;
  disabled: boolean;
  onSubmit: (answer: Answer) => void;
  onRetry: () => void;
}) {
  const empty = (): Answer => (question.type === 'choice' ? '' : question.type === 'order' ? [] : {});
  const [answer, setAnswer] = useState<Answer>(empty),
    [activePair, setActivePair] = useState<string | null>(null);
  useEffect(() => {
    if (phase === 'answer') {
      setAnswer(empty());
      setActivePair(null);
    }
  }, [phase, question.id]);
  const options = useMemo(() => {
    if (question.type === 'choice') return shuffled(question.options, randomFor(roundId + question.id));
    if (question.type === 'order') {
      const list = shuffled(question.tokens, randomFor(roundId + question.id));
      return list.join('|') === question.correct.join('|') ? [...list.slice(1), list[0]] : list;
    }
    return [];
  }, [question, roundId]);
  const pictures = useMemo(
    () =>
      question.type === 'match'
        ? shuffled(question.pairs, randomFor(roundId + question.id + 'pictures'))
        : [],
    [question, roundId],
  );
  const locked = disabled || phase !== 'answer';
  const connect = (right: string) => {
    if (!activePair || question.type !== 'match') return;
    const next = { ...(answer as Record<string, string>) };
    for (const key of Object.keys(next)) if (next[key] === right) delete next[key];
    next[activePair] = right;
    setAnswer(next);
    setActivePair(null);
  };
  return (
    <section className="question-panel" aria-label="Bài tập" data-question-id={question.id}>
      <div className="question-title">
        <span className="eyebrow">{question.topic}</span>
        <h2>{question.prompt}</h2>
      </div>
      {question.type === 'choice' && (
        <>
          <div className="question-stem">
            {question.illustration && (
              <span className="picture" aria-hidden="true">
                {question.illustration}
              </span>
            )}
            <span>{question.stem}</span>
          </div>
          <div className="answer-options">
            {options.map((option) => (
              <button
                key={option}
                disabled={locked}
                aria-pressed={answer === option}
                className={`answer-button ${answer === option ? 'chosen' : ''}`}
                onClick={() => setAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </>
      )}
      {question.type === 'order' && (
        <>
          <p className="small-text">Bấm các mảnh theo thứ tự. Bấm lại mảnh đã ghép để lấy ra.</p>
          <div className="sentence-answer" aria-label="Câu em ghép">
            {(answer as string[]).length ? (
              (answer as string[]).map((token, i) => (
                <button
                  disabled={locked}
                  className="word-token placed"
                  key={i}
                  onClick={() => setAnswer((answer as string[]).filter((_, j) => j !== i))}
                >
                  {token}
                  <span aria-hidden="true"> ×</span>
                </button>
              ))
            ) : (
              <span className="placeholder">Câu của em sẽ hiện ở đây…</span>
            )}
          </div>
          <div className="word-bank">
            {options.map((token, i) => (
              <button
                disabled={locked || (answer as string[]).includes(token)}
                className="word-token"
                key={i}
                onClick={() => setAnswer([...(answer as string[]), token])}
              >
                {token}
              </button>
            ))}
          </div>
        </>
      )}
      {question.type === 'match' && (
        <>
          <p className="small-text">Chọn từ bên trái rồi chọn hình bên phải. Cùng số là cặp em đã nối.</p>
          <div className="matching-board">
            <div>
              {question.pairs.map((pair, i) => (
                <button
                  key={pair.id}
                  disabled={locked}
                  aria-pressed={activePair === pair.id}
                  className={`match-word ${activePair === pair.id ? 'chosen' : ''} ${(answer as Record<string, string>)[pair.id] ? 'linked' : ''}`}
                  onClick={() => setActivePair(pair.id)}
                >
                  <span className="pair-badge">{i + 1}</span>
                  {pair.word}
                  <span aria-hidden="true">↔</span>
                </button>
              ))}
            </div>
            <div>
              {pictures.map((pair, i) => {
                const owner = Object.keys(answer as Record<string, string>).find(
                  (key) => (answer as Record<string, string>)[key] === pair.id,
                );
                const index = question.pairs.findIndex((p) => p.id === owner);
                return (
                  <button
                    key={pair.id}
                    disabled={locked || !activePair}
                    aria-label={`Hình ${i + 1}: ${pair.picture}${owner ? `, đã nối cặp ${index + 1}` : ''}`}
                    className={`match-picture ${owner ? 'linked' : ''}`}
                    onClick={() => connect(pair.id)}
                  >
                    <span className="picture" aria-hidden="true">
                      {pair.picture}
                    </span>
                    {owner && <span className="pair-badge">{index + 1}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
      {phase === 'wrong' ? (
        <div className="feedback needs-practice" role="status">
          <strong>Cùng thử lại nhé!</strong>
          <span>{question.hint}</span>
          <button className="button primary" onClick={onRetry} disabled={disabled}>
            Thử lại bài này ↻
          </button>
        </div>
      ) : phase === 'correct' ? (
        <div className="feedback success" role="status">
          <strong>Đúng rồi! Giỏi lắm! ✨</strong>
          <span>{question.target}</span>
        </div>
      ) : (
        <div className="submit-row">
          <button
            className="button primary submit-answer"
            disabled={locked || !isComplete(question, answer)}
            onClick={() => onSubmit(answer)}
          >
            {action} <span aria-hidden="true">➜</span>
          </button>
        </div>
      )}
    </section>
  );
}
