import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { version as APP_VERSION } from '../../package.json';
import { CHARACTERS, GAMES, GROUPS, characterById, gameById, groupById, mapById } from '../catalog';
import { accuracy, practiceItems } from '../engine';
import { QUESTIONS } from '../questions';
import type { Profile, SaveData } from '../types';
import { Sprite } from './Sprite';

export const dateLabel = (value: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
export function ProfilesPanel({
  data,
  onChange,
  onSelect,
  activeProfileId,
}: {
  data: SaveData;
  onChange: Dispatch<SetStateAction<SaveData>>;
  onSelect: (id: string) => void;
  activeProfileId?: string;
}) {
  const [name, setName] = useState(''),
    [classroom, setClassroom] = useState(''),
    [error, setError] = useState(''),
    [removing, setRemoving] = useState<Profile | null>(null);
  return (
    <>
      <p>Chọn hồ sơ của em để lưu điểm và những bài cần luyện thêm.</p>
      <div className="profile-list">
        {data.profiles.map((profile) => (
          <div className="profile-row" key={profile.id}>
            <button
              className={`profile-select ${profile.id === data.selectedProfileId ? 'chosen' : ''}`}
              aria-label={`Chọn hồ sơ ${profile.name}`}
              onClick={() => onSelect(profile.id)}
            >
              <span className="avatar">{profile.name.slice(0, 1).toLocaleUpperCase('vi')}</span>
              <span>
                <strong>{profile.name}</strong>
                <small>{profile.classroom || 'Hồ sơ học sinh'}</small>
              </span>
              {profile.id === data.selectedProfileId && <span aria-hidden="true">✓</span>}
            </button>
            <button
              className="icon-button delete-profile"
              disabled={activeProfileId === profile.id}
              title={
                activeProfileId === profile.id ? 'Hãy kết thúc lượt đang chơi trước khi xóa.' : undefined
              }
              aria-label={`Xóa hồ sơ ${profile.name}`}
              onClick={() => setRemoving(profile)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      {removing && (
        <div className="confirm-box" role="alert">
          <strong>Xóa hồ sơ {removing.name} và toàn bộ kết quả của hồ sơ này?</strong>
          <p>Hãy xuất bản sao lưu nếu muốn giữ kết quả.</p>
          <div className="button-row">
            <button
              className="button danger"
              onClick={() => {
                onChange((prev) => ({
                  ...prev,
                  profiles: prev.profiles.filter((p) => p.id !== removing.id),
                  records: prev.records.filter((r) => r.profileId !== removing.id),
                  selectedProfileId: prev.selectedProfileId === removing.id ? null : prev.selectedProfileId,
                }));
                setRemoving(null);
              }}
            >
              Xóa hồ sơ
            </button>
            <button className="button secondary" onClick={() => setRemoving(null)}>
              Giữ lại
            </button>
          </div>
        </div>
      )}
      <form
        className="profile-form"
        onSubmit={(event) => {
          event.preventDefault();
          const clean = name.normalize('NFC').trim();
          if (clean.length < 1) {
            setError('Em hãy nhập tên trước nhé.');
            return;
          }
          const id = crypto.randomUUID();
          onChange((prev) => ({
            ...prev,
            profiles: [
              ...prev.profiles,
              {
                id,
                name: clean,
                classroom: classroom.normalize('NFC').trim(),
                createdAt: new Date().toISOString(),
              },
            ],
            selectedProfileId: id,
          }));
          setName('');
          setError('');
          onSelect(id);
        }}
      >
        <h3>Tạo hồ sơ mới</h3>
        <label>
          Tên học sinh
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            maxLength={60}
            autoComplete="off"
            placeholder="Ví dụ: Minh Anh"
          />
        </label>
        <label>
          Lớp <span className="muted">(không bắt buộc)</span>
          <input
            value={classroom}
            onChange={(event) => setClassroom(event.target.value)}
            maxLength={30}
            autoComplete="off"
            placeholder="Ví dụ: 2A"
          />
        </label>
        {error && (
          <p role="alert" className="error-text">
            {error}
          </p>
        )}
        <button type="submit" className="button primary">
          Tạo và chọn hồ sơ
        </button>
      </form>
      <p className="small-text">
        Hồ sơ lưu trên thiết bị này. Có thể sao lưu và chuyển sang máy khác ở mục Hồ sơ chơi.
      </p>
    </>
  );
}
export function HistoryPanel({
  data,
  onExport,
  onCSV,
  onImport,
  onStart,
}: {
  data: SaveData;
  onExport: () => void;
  onCSV: () => void;
  onImport: () => void;
  onStart: () => void;
}) {
  const [filter, setFilter] = useState(data.selectedProfileId || 'all'),
    [page, setPage] = useState(0);
  const records = useMemo(
    () =>
      data.records
        .filter((record) => filter === 'all' || record.profileId === filter)
        .sort((a, b) => b.endedAt.localeCompare(a.endedAt)),
    [data.records, filter],
  );
  const practice = practiceItems(records),
    pages = Math.max(1, Math.ceil(records.length / 12));
  return (
    <>
      <div className="history-toolbar">
        <label>
          Xem hồ sơ
          <select
            value={filter}
            onChange={(event) => {
              setFilter(event.target.value);
              setPage(0);
            }}
          >
            <option value="all">Tất cả học sinh</option>
            {data.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.classroom ? ` · ${p.classroom}` : ''}
              </option>
            ))}
          </select>
        </label>
        <div className="button-row">
          <button className="button small secondary" onClick={onExport}>
            Sao lưu tất cả (JSON)
          </button>
          <button className="button small secondary" onClick={onImport}>
            Nhập bản sao lưu
          </button>
          <button className="button small secondary" onClick={onCSV}>
            Xuất bảng điểm (CSV)
          </button>
        </div>
      </div>
      <div className="stats">
        <div>
          <strong>{records.length}</strong>
          <span>Lượt chơi</span>
        </div>
        <div>
          <strong>{Math.max(0, ...records.map((r) => r.score))}</strong>
          <span>Điểm cao nhất / 100</span>
        </div>
        <div>
          <strong>{accuracy(records)}%</strong>
          <span>Đúng / số lần thử</span>
        </div>
      </div>
      {!records.length ? (
        <div className="empty-state">
          <Sprite id="sprout" size={90} />
          <h3>Hành trình của em bắt đầu từ đây!</h3>
          <p>Chơi một lượt để thấy điểm và bài cần luyện thêm.</p>
          <button className="button primary" onClick={onStart}>
            Bắt đầu chơi
          </button>
        </div>
      ) : (
        <>
          <details className="practice-details" open={practice.length > 0}>
            <summary>Cần luyện thêm · {practice.length} mục</summary>
            {practice.length ? (
              <div className="practice-tags">
                {practice.map((item) => (
                  <span key={item.target}>
                    {item.target}
                    <small>{item.count} lần cần sửa</small>
                  </span>
                ))}
              </div>
            ) : (
              <p>Em chưa có bài trả lời sai trong các lượt này. Tuyệt lắm!</p>
            )}
          </details>
          <div className="record-list">
            {records.slice(page * 12, (page + 1) * 12).map((record) => {
              const profile = data.profiles.find((p) => p.id === record.profileId)!;
              return (
                <details className="record" key={record.id}>
                  <summary>
                    <Sprite id={record.selection.character} size={48} />
                    <div className="record-title">
                      <strong>
                        {profile.name} · {gameById(record.selection.game).name}
                      </strong>
                      <small>
                        {dateLabel(record.endedAt)} ·{' '}
                        {mapById(record.selection.game, record.selection.map).name}
                      </small>
                    </div>
                    <span className="record-score">
                      {record.score}
                      <small>/100</small>
                    </span>
                    <span className={`outcome ${record.outcome}`}>
                      {record.outcome === 'completed'
                        ? 'Hoàn thành'
                        : record.outcome === 'lost'
                          ? 'Hết lượt'
                          : 'Dừng giữa chừng'}
                    </span>
                    <span aria-hidden="true">⌄</span>
                  </summary>
                  <p>
                    {groupById(record.selection.group).name} ·{' '}
                    {characterById(record.selection.character).name} · {record.completed}/10 thử thách
                  </p>
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Bài luyện</th>
                          <th>Em đã chọn</th>
                          <th>Kết quả</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.history.map((attempt, i) => (
                          <tr key={i}>
                            <td>{attempt.target}</td>
                            <td>{attempt.answer}</td>
                            <td>{attempt.correct ? '✓ Đúng' : '↻ Cần sửa'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              );
            })}
          </div>
          {pages > 1 && (
            <div className="pagination">
              <button
                className="button small secondary"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                ← Trang trước
              </button>
              <span>
                Trang {page + 1}/{pages}
              </span>
              <button
                className="button small secondary"
                disabled={page >= pages - 1}
                onClick={() => setPage(page + 1)}
              >
                Trang sau →
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
export function HelpPanel() {
  const [tab, setTab] = useState<'help' | 'bank'>('help'),
    [query, setQuery] = useState(''),
    [group, setGroup] = useState('all');
  const questions = QUESTIONS.filter(
    (q) =>
      (group === 'all' || q.group === group) &&
      `${q.target} ${q.topic}`.toLocaleLowerCase('vi').includes(query.toLocaleLowerCase('vi')),
  );
  return (
    <>
      <div className="tabs" role="tablist" aria-label="Hướng dẫn và học liệu">
        <button role="tab" aria-selected={tab === 'help'} onClick={() => setTab('help')}>
          Cách chơi
        </button>
        <button role="tab" aria-selected={tab === 'bank'} onClick={() => setTab('bank')}>
          Bộ học liệu ({QUESTIONS.length})
        </button>
      </div>
      {tab === 'help' ? (
        <div className="help-content">
          <h3>Mỗi bài đúng là một bước phiêu lưu!</h3>
          <ol>
            <li>Chọn hồ sơ học sinh ở màn hình chính.</li>
            <li>Chọn nội dung → game → nhân vật → map.</li>
            <li>Làm bài rồi bấm nút hành động. Chưa chắc thì đổi đáp án trước khi xác nhận.</li>
          </ol>
          <div className="help-grid">
            {GAMES.map((game) => (
              <div key={game.id}>
                <span aria-hidden="true">{game.symbol}</span>
                <strong>{game.name}</strong>
                <p>{game.description}</p>
              </div>
            ))}
          </div>
          <h3>Điểm và lượt thử</h3>
          <p>
            Mỗi lượt có 10 thử thách, 3 trái tim (hoặc 3 ô năng lượng). Đúng ngay lần đầu: 10 điểm. Đúng sau
            khi sửa: 5 điểm. Mỗi lần xác nhận sai mất một tim. Hết tim thì kết thúc; em luôn có thể thử lại.
          </p>
          <p>
            Nhân vật và chướng ngại vật chờ khi em làm bài. Không cần đọc nhanh. Các nhân vật có cùng khả
            năng; các map chỉ thay hình ảnh.
          </p>
          <h3>Ba cách làm bài</h3>
          <ul>
            <li>
              <strong>Chọn:</strong> bấm một đáp án rồi xác nhận.
            </li>
            <li>
              <strong>Xếp câu:</strong> bấm các mảnh theo thứ tự. Bấm mảnh đã ghép để lấy ra.
            </li>
            <li>
              <strong>Nối:</strong> chọn từ bên trái, rồi chọn hình bên phải. Các nhãn cùng số cho biết cặp em
              đã nối.
            </li>
          </ul>
          <h3>Dành cho giáo viên</h3>
          <p>
            Mục Hồ sơ chơi có điểm, lịch sử từng lần thử và bài cần luyện thêm. Dữ liệu lưu trên thiết bị; hãy
            xuất JSON để sao lưu hoặc chuyển máy. CSV dùng để xem bảng điểm trong ứng dụng bảng tính.
          </p>
        </div>
      ) : (
        <>
          <p>
            120 bài tự biên soạn theo các chủ đề quen thuộc. Giáo viên có thể xem trước nội dung và gợi ý dưới
            đây.
          </p>
          <div className="library-filter">
            <label>
              Nhóm nội dung
              <select value={group} onChange={(event) => setGroup(event.target.value)}>
                <option value="all">Tất cả</option>
                {GROUPS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tìm từ
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: lá cây"
              />
            </label>
          </div>
          <p className="small-text">{questions.length} bài phù hợp</p>
          <div className="library-list">
            {questions.map((q) => (
              <details key={q.id}>
                <summary>
                  <span>{q.illustration || '🧩'}</span>
                  <strong>{q.target}</strong>
                  <small>{q.topic}</small>
                </summary>
                <p>{q.prompt}</p>
                <p>{q.hint}</p>
                {q.type === 'choice' && (
                  <p>
                    Đáp án: <strong>{q.correct}</strong>
                  </p>
                )}
              </details>
            ))}
          </div>
        </>
      )}
    </>
  );
}
export function SettingsPanel({
  data,
  onChange,
}: {
  data: SaveData;
  onChange: Dispatch<SetStateAction<SaveData>>;
}) {
  return (
    <>
      <p>Điều chỉnh cho buổi học của em.</p>
      <label className="setting-toggle">
        <span>
          <strong>Âm thanh vui</strong>
          <small>Hiệu ứng nhẹ khi trả lời</small>
        </span>
        <input
          type="checkbox"
          checked={data.settings.sound}
          onChange={(event) =>
            onChange((prev) => ({ ...prev, settings: { ...prev.settings, sound: event.target.checked } }))
          }
        />
      </label>
      <label className="setting-toggle">
        <span>
          <strong>Giảm chuyển động</strong>
          <small>Rút ngắn hoạt ảnh, giữ nguyên luật và điểm</small>
        </span>
        <input
          type="checkbox"
          checked={data.settings.reducedMotion}
          onChange={(event) =>
            onChange((prev) => ({
              ...prev,
              settings: { ...prev.settings, reducedMotion: event.target.checked },
            }))
          }
        />
      </label>
      <div className="info-box">
        <strong>Học và chơi trên thiết bị này</strong>
        <p>
          Game không dùng micro. Hồ sơ được lưu tại máy, có thể sao lưu ở mục Hồ sơ chơi. Bản cài Windows chơi
          được khi không có Internet.
        </p>
      </div>
      <p className="small-text">
        Byte Odyssey · phiên bản {APP_VERSION} · {GAMES.length} game · {CHARACTERS.length} nhân vật · 23 map
      </p>
    </>
  );
}
