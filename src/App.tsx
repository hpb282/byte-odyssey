import { useEffect, useRef, useState } from 'react';
import { CHARACTERS, GAMES, GROUPS, characterById, gameById, groupById, mapById } from './catalog';
import { accuracy, createRound, isFinished, practiceItems, reduceRound, toRecord } from './engine';
import { questionById } from './questions';
import {
  addRecord,
  downloadFile,
  loadSave,
  mergeSave,
  parseSave,
  readActive,
  recordsCSV,
  saveActive,
  writeSave,
} from './storage';
import { playSound } from './sound';
import { Sprite } from './components/Sprite';
import { Icon } from './components/Icon';
import { Scene } from './components/Scene';
import { Modal } from './components/Modal';
import { QuestionPanel } from './components/QuestionPanel';
import { HelpPanel, HistoryPanel, ProfilesPanel, SettingsPanel } from './components/Panels';
import type { Answer, Round, Selection } from './types';

type Screen = 'home' | 'content' | 'game' | 'character' | 'map' | 'play' | 'result';
type Dialog = 'profiles' | 'settings' | 'help' | 'history' | 'pause' | 'exit' | 'new-round' | null;
const stages: Screen[] = ['content', 'game', 'character', 'map'];
const titles = {
  content: 'Chọn nội dung luyện tập',
  game: 'Chọn game',
  character: 'Chọn nhân vật',
  map: 'Chọn map',
};

export default function App() {
  const [initial] = useState(() => loadSave());
  const [data, setData] = useState(initial.data),
    [notice, setNotice] = useState(initial.warning),
    [storageIssue, setStorageIssue] = useState('');
  const [round, setRound] = useState<Round | null>(() => readActive(initial.data));
  const [screen, setScreen] = useState<Screen>('home'),
    [dialog, setDialog] = useState<Dialog>(null),
    [pendingStart, setPendingStart] = useState(false);
  const [selection, setSelection] = useState<Partial<Selection>>({}),
    [installPrompt, setInstallPrompt] = useState<{ prompt: () => Promise<void> } | null>(null);
  const heading = useRef<HTMLHeadingElement>(null),
    fileInput = useRef<HTMLInputElement>(null),
    lastSound = useRef('');
  const profile = data.profiles.find((p) => p.id === data.selectedProfileId),
    game = selection.game ? gameById(selection.game) : null;
  const active = round && !isFinished(round) ? round : null,
    paused = screen === 'play' && dialog !== null;
  const index = stages.indexOf(screen),
    setup = index >= 0;

  useEffect(() => {
    const error = writeSave(data);
    setStorageIssue(error);
    if (error) setNotice(error);
  }, [data]);
  useEffect(() => {
    const error = saveActive(active);
    if (error) setNotice(error);
  }, [active]);
  useEffect(() => {
    if (round && isFinished(round)) setData((prev) => addRecord(prev, toRecord(round)));
  }, [round]);
  useEffect(() => {
    if (screen === 'play' && round?.phase === 'correct' && !paused) {
      const timeout = setTimeout(
        () => setRound((prev) => (prev ? reduceRound(prev, { type: 'advance' }) : prev)),
        data.settings.reducedMotion ? 140 : 1150,
      );
      return () => clearTimeout(timeout);
    }
  }, [screen, round, paused, data.settings.reducedMotion]);
  useEffect(() => {
    if (round && isFinished(round) && screen === 'play') setScreen('result');
  }, [round, screen]);
  useEffect(() => {
    if (round && !data.profiles.some((p) => p.id === round.profileId)) {
      setRound(null);
      setScreen('home');
    }
  }, [data.profiles, round]);
  useEffect(() => {
    heading.current?.focus();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [screen]);
  useEffect(() => {
    const onHidden = () => {
      if (document.hidden && screen === 'play') setDialog((current) => current || 'pause');
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [screen]);
  useEffect(() => {
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as unknown as { prompt: () => Promise<void> });
    };
    window.addEventListener('beforeinstallprompt', onInstall);
    return () => window.removeEventListener('beforeinstallprompt', onInstall);
  }, []);

  const closeDialog = () => {
    setDialog(null);
    setPendingStart(false);
  };
  const setupStart = () => {
    setSelection({});
    setScreen('content');
    setDialog(null);
    setRound(null);
  };
  const begin = () => {
    if (active) {
      setDialog('new-round');
      return;
    }
    if (!profile) {
      setPendingStart(true);
      setDialog('profiles');
      return;
    }
    setupStart();
  };
  const selectProfile = (id: string) => {
    setData((prev) => ({ ...prev, selectedProfileId: id }));
    setDialog(null);
    if (pendingStart) {
      setPendingStart(false);
      setupStart();
    }
  };
  const exportJSON = () =>
    downloadFile(
      `byte-odyssey-sao-luu-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
    );
  const importJSON = async (file: File) => {
    try {
      if (file.size > 10_000_000) throw new Error('Hãy dùng bản sao lưu dưới 10 MB.');
      const incoming = parseSave(await file.text());
      setData((prev) => mergeSave(prev, incoming));
      setNotice('Đã nhập bản sao lưu. Hồ sơ và kết quả hiện có vẫn được giữ.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Không đọc được file sao lưu.');
    }
  };
  const startRound = () => {
    if (!profile) {
      setDialog('profiles');
      setNotice('Hãy chọn hồ sơ học sinh trước khi bắt đầu.');
      return;
    }
    try {
      const next = createRound(profile.id, selection as Selection);
      lastSound.current = '';
      setRound(next);
      setScreen('play');
      setDialog(null);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Hãy chọn đủ thông tin.');
    }
  };
  const submit = (answer: Answer) => {
    if (!round || paused) return;
    const next = reduceRound(round, { type: 'submit', answer });
    if (next === round) return;
    const soundKey = next.id + ':' + next.history.length;
    if (lastSound.current !== soundKey) {
      playSound(next.history.at(-1)!.correct, data.settings.sound);
      lastSound.current = soundKey;
    }
    setRound(next);
  };
  const abort = () => {
    if (round && !isFinished(round)) setRound(reduceRound(round, { type: 'abort' }));
    setDialog(null);
    setScreen('home');
  };
  const canNext =
    screen === 'content'
      ? !!selection.group
      : screen === 'game'
        ? !!selection.game
        : screen === 'character'
          ? !!selection.character
          : !!selection.map;
  const next = () => {
    if (!canNext) return;
    if (screen === 'map') {
      startRound();
      return;
    }
    setScreen(stages[index + 1]);
  };
  const back = () => setScreen(index === 0 ? 'home' : stages[index - 1]);
  const stepSummary = (
    <div className="selection-summary">
      {selection.group && screen !== 'content' && (
        <span>
          Nội dung: <strong>{groupById(selection.group).name}</strong>
        </span>
      )}
      {selection.game && ['character', 'map'].includes(screen) && (
        <span>
          Game: <strong>{gameById(selection.game).name}</strong>
        </span>
      )}
      {selection.character && screen === 'map' && (
        <span>
          <Sprite id={selection.character} size={28} />
          Nhân vật: <strong>{characterById(selection.character).name}</strong>
        </span>
      )}
    </div>
  );

  return (
    <div className={`app ${data.settings.reducedMotion ? 'reduce-motion' : ''}`}>
      <div className="world-backdrop" aria-hidden="true">
        <div className="cloud cloud-one" />
        <div className="cloud cloud-two" />
        <div className="cloud cloud-three" />
        <div className="hill hill-one" />
        <div className="hill hill-two" />
        <div className="ground" />
      </div>
      <header className={`app-header ${screen === 'home' ? 'home-header' : ''}`} inert={dialog !== null}>
        {screen !== 'home' && (
          <button
            className="brand brand-small"
            aria-label="Về màn hình chính"
            onClick={() => (screen === 'play' ? setDialog('exit') : setScreen('home'))}
          >
            <span>BYTE</span>
            <span>ODYSSEY</span>
          </button>
        )}
        <div className="header-actions">
          <button
            className="button cream profile-chip"
            aria-label="Chọn hồ sơ"
            disabled={screen === 'play'}
            onClick={() => setDialog('profiles')}
          >
            <Icon name="user" />
            <span>
              {profile?.name || 'Chọn hồ sơ'}
              {profile?.classroom && <small>{profile.classroom}</small>}
            </span>
          </button>
          <button
            className="button cream settings-button"
            aria-label="Cài đặt"
            onClick={() => setDialog('settings')}
          >
            <span aria-hidden="true">⚙</span>
            <span>Cài đặt</span>
          </button>
        </div>
      </header>
      {(notice || storageIssue) && (
        <div className={`notice ${storageIssue ? 'warning' : ''}`} role="status">
          <span>{storageIssue || notice}</span>
          <button aria-label="Ẩn thông báo" onClick={() => setNotice('')}>
            ×
          </button>
        </div>
      )}

      <main className={screen === 'play' ? 'play-main' : 'page-main'} inert={dialog !== null}>
        {screen === 'home' && (
          <section className="home-hero">
            <h1 ref={heading} tabIndex={-1} className="brand brand-large">
              <span>BYTE</span>
              <span>ODYSSEY</span>
            </h1>
            <p className="hero-tagline">Khám phá thế giới chữ</p>
            <div className="hero-stage">
              <div className="hero-mascot">
                <div className="spark spark-one">✦</div>
                <Sprite id="byte" size={235} />
                <div className="spark spark-two">✧</div>
                <div className="mascot-shadow" />
              </div>
              <div className="hero-menu">
                <button className="button primary hero-start" onClick={begin}>
                  <Icon name="play" />
                  Bắt đầu chơi
                </button>
                <div className="hero-secondary">
                  <button className="button cream" onClick={() => setDialog('history')}>
                    <span aria-hidden="true">▤</span>Hồ sơ chơi
                  </button>
                  <button className="button cream" onClick={() => setDialog('help')}>
                    <span aria-hidden="true">?</span>Hướng dẫn
                  </button>
                </div>
              </div>
            </div>
            {active && (
              <div className="resume-banner">
                <div>
                  <strong>Lượt phiêu lưu đang chờ!</strong>
                  <span>
                    {data.profiles.find((p) => p.id === active.profileId)?.name} ·{' '}
                    {gameById(active.selection.game).name} · {active.index}/10 thử thách
                  </span>
                </div>
                <button
                  className="button secondary"
                  onClick={() => {
                    setData((prev) => ({ ...prev, selectedProfileId: active.profileId }));
                    setSelection(active.selection);
                    setScreen('play');
                  }}
                >
                  Tiếp tục lượt chơi →
                </button>
              </div>
            )}
            <div className="home-chips">
              <span>✦ 4 game thú vị</span>
              <span>10 bạn đồng hành</span>
              <span>23 vùng đất</span>
            </div>
            <p className="home-note">Mỗi ngày một chút, cùng Byte học thật vui!</p>
            {installPrompt && (
              <button
                className="install-link"
                onClick={() => {
                  void installPrompt.prompt();
                  setInstallPrompt(null);
                }}
              >
                ＋ Cài Byte Odyssey trên thiết bị
              </button>
            )}
          </section>
        )}

        {setup && (
          <section className="setup-screen">
            <ol className="steps" aria-label="Các bước chuẩn bị">
              {['Nội dung', 'Game', 'Nhân vật', 'Map'].map((label, i) => (
                <li
                  key={label}
                  className={`${i === index ? 'current' : ''} ${i < index ? 'done' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                >
                  <span>{i < index ? '✓' : i + 1}</span>
                  {label}
                </li>
              ))}
            </ol>
            <h1 ref={heading} tabIndex={-1}>
              {titles[screen as keyof typeof titles]}
            </h1>
            {index > 0 ? stepSummary : <p className="page-subtitle">Em chọn một nội dung nhé!</p>}
            {screen === 'content' && (
              <div className="content-grid">
                {GROUPS.map((group) => (
                  <button
                    className={`choice-card content-card ${group.color} ${selection.group === group.id ? 'selected' : ''}`}
                    key={group.id}
                    aria-pressed={selection.group === group.id}
                    onClick={() => setSelection((prev) => ({ ...prev, group: group.id }))}
                  >
                    <span className="selection-tick" aria-hidden="true">
                      ✓
                    </span>
                    <div className={`learning-symbol ${group.id}`} aria-hidden="true">
                      {group.id === 'letters' ? (
                        <>
                          <span>A</span>
                          <span>B</span>
                          <span>C</span>
                        </>
                      ) : group.id === 'syllables' ? (
                        <>
                          <span>a</span>
                          <span>á</span>
                        </>
                      ) : (
                        <>
                          <span>học</span>
                          <span>sinh</span>
                        </>
                      )}
                    </div>
                    <h2>{group.name}</h2>
                    <p>{group.description}</p>
                  </button>
                ))}
              </div>
            )}
            {screen === 'game' && (
              <div className="game-grid">
                {GAMES.map((item) => (
                  <button
                    className={`choice-card game-card ${selection.game === item.id ? 'selected' : ''}`}
                    key={item.id}
                    aria-pressed={selection.game === item.id}
                    onClick={() =>
                      setSelection((prev) => ({
                        ...prev,
                        game: item.id,
                        map: prev.game === item.id ? prev.map : undefined,
                      }))
                    }
                  >
                    <span className="selection-tick" aria-hidden="true">
                      ✓
                    </span>
                    <div className="card-scene">
                      <Scene game={item.id} map={item.maps[0].id} thumbnail />
                    </div>
                    <div className="game-card-copy">
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            {screen === 'character' && (
              <div className="character-grid">
                {CHARACTERS.map((character) => (
                  <button
                    key={character.id}
                    className={`choice-card character-card ${selection.character === character.id ? 'selected' : ''}`}
                    aria-pressed={selection.character === character.id}
                    onClick={() => setSelection((prev) => ({ ...prev, character: character.id }))}
                  >
                    <span className="selection-tick" aria-hidden="true">
                      ✓
                    </span>
                    <Sprite id={character.id} size={120} />
                    <h2>{character.name}</h2>
                  </button>
                ))}
              </div>
            )}
            {screen === 'map' && game && (
              <>
                <div className={`map-grid ${game.maps.length === 5 ? 'has-five' : ''}`}>
                  {game.maps.map((map) => (
                    <button
                      key={map.id}
                      className={`choice-card map-card ${selection.map === map.id ? 'selected' : ''}`}
                      aria-pressed={selection.map === map.id}
                      onClick={() => setSelection((prev) => ({ ...prev, map: map.id }))}
                    >
                      <span className="selection-tick" aria-hidden="true">
                        ✓
                      </span>
                      <div className="card-scene">
                        <Scene game={game.id} map={map.id} character={selection.character} thumbnail />
                      </div>
                      <h2>{map.name}</h2>
                    </button>
                  ))}
                </div>
                <p className="map-note">Chọn cảnh em thích · Các map có cùng luật chơi</p>
              </>
            )}
            <nav className="setup-nav" aria-label="Điều hướng lựa chọn">
              <button className="button cream" onClick={back}>
                ← Quay lại
              </button>
              <button className="button primary" disabled={!canNext} onClick={next}>
                {screen === 'map' ? 'Bắt đầu chơi ▶' : 'Tiếp tục →'}
              </button>
            </nav>
          </section>
        )}

        {screen === 'play' && round && !isFinished(round) && (
          <section className="game-screen">
            <div className="play-hud">
              <div>
                <h1 ref={heading} tabIndex={-1}>
                  {gameById(round.selection.game).name}
                </h1>
                <span>
                  {data.profiles.find((p) => p.id === round.profileId)?.name} ·{' '}
                  {groupById(round.selection.group).name}
                </span>
              </div>
              <div className="score-box">
                Điểm <strong>{round.score}</strong>
              </div>
              <div className="progress-box">
                <span>
                  Thử thách <strong>{round.index + 1}/10</strong>
                </span>
                <progress max={10} value={round.index} aria-label="Số thử thách hoàn thành" />
              </div>
              <div
                className="lives"
                role="img"
                aria-label={`Còn ${round.lives} ${round.selection.game === 'space' ? 'ô năng lượng' : 'trái tim'}`}
              >
                {[0, 1, 2].map((i) => (
                  <span key={i} className={i < round.lives ? 'full' : 'empty'} aria-hidden="true">
                    {round.selection.game === 'space' ? '▣' : '♥'}
                  </span>
                ))}
              </div>
              <button
                className="button cream pause-button"
                aria-label="Tạm dừng"
                onClick={() => setDialog('pause')}
              >
                <Icon name="pause" />
              </button>
            </div>
            <div
              className={`play-world ${round.phase === 'correct' ? 'celebrating' : ''}`}
              style={{ background: mapById(round.selection.game, round.selection.map).sky }}
            >
              <Scene
                game={round.selection.game}
                map={round.selection.map}
                character={round.selection.character}
                completed={round.index}
                phase={round.phase}
                reducedMotion={data.settings.reducedMotion}
                paused={paused}
              />
              <span className="world-caption">{mapById(round.selection.game, round.selection.map).name}</span>
            </div>
            <QuestionPanel
              key={round.id + ':' + round.index}
              question={questionById.get(round.questionIds[round.index])!}
              roundId={round.id}
              phase={round.phase}
              action={gameById(round.selection.game).action}
              disabled={paused}
              onSubmit={submit}
              onRetry={() => setRound((prev) => (prev ? reduceRound(prev, { type: 'retry' }) : prev))}
            />
          </section>
        )}

        {screen === 'result' && round && isFinished(round) && (
          <section className="results-screen panel">
            <span className="eyebrow">Kết quả lượt chơi</span>
            <h1 ref={heading} tabIndex={-1}>
              {round.phase === 'completed' ? 'Hoàn thành rồi!' : 'Cùng thử lại nhé!'}
            </h1>
            <div className="result-hero">
              <Sprite id={round.selection.character} size={135} />
              <div className="result-score">
                <strong>{round.score}</strong>
                <span>/ 100 điểm</span>
              </div>
              <span className="result-medal" aria-hidden="true">
                {round.phase === 'completed' ? '🏆' : '🌱'}
              </span>
            </div>
            <p>
              {data.profiles.find((p) => p.id === round.profileId)?.name}, em đã vượt{' '}
              <strong>{round.index}/10 thử thách</strong> trong {gameById(round.selection.game).name}.
            </p>
            <div className="stats">
              <div>
                <strong>{round.history.filter((a) => a.correct).length}</strong>
                <span>Bài đã làm đúng</span>
              </div>
              <div>
                <strong>{round.history.filter((a) => !a.correct).length}</strong>
                <span>Lần cần sửa</span>
              </div>
              <div>
                <strong>{accuracy([toRecord(round)])}%</strong>
                <span>Đúng / số lần thử</span>
              </div>
            </div>
            <div className="result-practice">
              <h2>Cùng luyện thêm</h2>
              {practiceItems([toRecord(round)]).length ? (
                <div className="practice-tags">
                  {practiceItems([toRecord(round)]).map((item) => (
                    <span key={item.target}>{item.target}</span>
                  ))}
                </div>
              ) : (
                <p>Em làm đúng ngay từ lần đầu. Tuyệt lắm! ✨</p>
              )}
            </div>
            <p className="saved-note" role="status">
              {storageIssue
                ? 'Kết quả đang ở bộ nhớ tạm. Hãy xuất bản sao lưu ở Hồ sơ chơi.'
                : '✓ Đã lưu kết quả vào hồ sơ học sinh.'}
            </p>
            <div className="result-actions">
              <button
                className="button primary"
                onClick={() => {
                  const next = createRound(round.profileId, round.selection);
                  setData((prev) => ({ ...prev, selectedProfileId: round.profileId }));
                  setRound(next);
                  setScreen('play');
                }}
              >
                Chơi lại ↻
              </button>
              <button
                className="button secondary"
                onClick={() => {
                  setSelection(round.selection);
                  setRound(null);
                  setScreen('content');
                }}
              >
                Chọn lại nội dung
              </button>
              <button className="button cream" onClick={() => setDialog('history')}>
                Xem hồ sơ
              </button>
              <button
                className="button cream"
                onClick={() => {
                  setRound(null);
                  setScreen('home');
                }}
              >
                Về màn hình chính
              </button>
            </div>
          </section>
        )}
      </main>
      <footer className="app-footer">
        Byte Odyssey <span aria-hidden="true">✦</span> Cùng học, cùng khám phá
      </footer>
      <input
        ref={fileInput}
        type="file"
        accept=".json,application/json"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void importJSON(file);
          event.target.value = '';
        }}
      />

      {dialog === 'profiles' && (
        <Modal title="Chọn hồ sơ học sinh" onClose={closeDialog}>
          <ProfilesPanel
            data={data}
            onChange={setData}
            onSelect={selectProfile}
            activeProfileId={active?.profileId}
          />
        </Modal>
      )}
      {dialog === 'settings' && (
        <Modal title="Cài đặt" onClose={closeDialog}>
          <SettingsPanel data={data} onChange={setData} />
        </Modal>
      )}
      {dialog === 'help' && (
        <Modal title="Cùng Byte khám phá" onClose={closeDialog} wide>
          <HelpPanel />
        </Modal>
      )}
      {dialog === 'history' && (
        <Modal title="Hồ sơ chơi" onClose={closeDialog} wide>
          <HistoryPanel
            data={data}
            onExport={exportJSON}
            onCSV={() =>
              downloadFile('byte-odyssey-bang-diem.csv', recordsCSV(data), 'text/csv;charset=utf-8')
            }
            onImport={() => fileInput.current?.click()}
            onStart={() => {
              setDialog(null);
              begin();
            }}
          />
        </Modal>
      )}
      {dialog === 'pause' && (
        <Modal title="Nghỉ một chút nhé!" onClose={closeDialog}>
          <div className="pause-content">
            <Sprite id={round?.selection.character || 'byte'} size={115} />
            <p>Lượt chơi và điểm của em vẫn được giữ.</p>
            <button className="button primary" onClick={closeDialog}>
              Tiếp tục chơi ▶
            </button>
            <button className="button cream" onClick={() => setDialog('settings')}>
              Cài đặt
            </button>
            <button className="button secondary" onClick={() => setDialog('exit')}>
              Về màn hình chính
            </button>
          </div>
        </Modal>
      )}
      {dialog === 'exit' && (
        <Modal title="Dừng lượt chơi này?" onClose={closeDialog}>
          <p>
            Kết quả hiện tại được lưu với trạng thái dừng giữa chừng. Em có thể bắt đầu một lượt mới sau đó.
          </p>
          <div className="button-row">
            <button className="button primary" onClick={closeDialog}>
              Chơi tiếp
            </button>
            <button className="button secondary" onClick={abort}>
              Lưu và về màn hình chính
            </button>
          </div>
        </Modal>
      )}
      {dialog === 'new-round' && (
        <Modal title="Em còn một lượt đang chơi" onClose={closeDialog}>
          <p>Muốn bắt đầu lượt mới? Kết quả lượt cũ sẽ được lưu là dừng giữa chừng.</p>
          <div className="button-row">
            <button
              className="button primary"
              onClick={() => {
                setDialog(null);
                if (active) {
                  setSelection(active.selection);
                  setData((prev) => ({ ...prev, selectedProfileId: active.profileId }));
                  setScreen('play');
                }
              }}
            >
              Tiếp tục lượt cũ
            </button>
            <button
              className="button secondary"
              onClick={() => {
                if (active)
                  setData((prev) => addRecord(prev, toRecord(reduceRound(active, { type: 'abort' }))));
                setRound(null);
                if (!profile) {
                  setDialog('profiles');
                  setPendingStart(true);
                } else setupStart();
              }}
            >
              Bắt đầu lượt mới
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
