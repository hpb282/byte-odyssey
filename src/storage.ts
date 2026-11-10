import { questionById } from './questions';
import { validSelection } from './engine';
import { gameById, groupById, mapById } from './catalog';
import type { Attempt, PlayRecord, Profile, Round, SaveData } from './types';

export const SAVE_KEY = 'byte-odyssey:data:v1',
  ACTIVE_KEY = 'byte-odyssey:active:v1';
export const emptySave = (): SaveData => ({
  version: 1,
  profiles: [],
  records: [],
  selectedProfileId: null,
  settings: { sound: true, reducedMotion: false },
});
type Store = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const obj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, max = 3000): v is string => typeof v === 'string' && v.length > 0 && v.length <= max;
const integer = (v: unknown, min: number, max: number) =>
  typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const date = (v: unknown) => str(v, 60) && Number.isFinite(Date.parse(v));
function validAttempts(v: unknown): v is Attempt[] {
  return (
    Array.isArray(v) &&
    v.length <= 50 &&
    v.every(
      (a) =>
        obj(a) &&
        str(a.questionId, 100) &&
        str(a.prompt) &&
        str(a.target) &&
        str(a.answer) &&
        typeof a.correct === 'boolean' &&
        date(a.at),
    )
  );
}
function validProfile(p: unknown): p is Profile {
  return (
    obj(p) &&
    str(p.id, 100) &&
    str(p.name, 60) &&
    typeof p.classroom === 'string' &&
    p.classroom.length <= 30 &&
    date(p.createdAt)
  );
}
function validRecord(r: unknown): r is PlayRecord {
  return (
    obj(r) &&
    str(r.id, 100) &&
    str(r.profileId, 100) &&
    validSelection(r.selection) &&
    integer(r.score, 0, 100) &&
    integer(r.lives, 0, 3) &&
    integer(r.completed, 0, 10) &&
    ['completed', 'lost', 'abandoned'].includes(r.outcome as string) &&
    validAttempts(r.history) &&
    date(r.startedAt) &&
    date(r.endedAt) &&
    (r.outcome !== 'completed' || r.completed === 10) &&
    (r.outcome !== 'lost' || r.lives === 0)
  );
}
export function parseSave(raw: string): SaveData {
  if (raw.length > 10_000_000) throw new Error('File quá lớn. Hãy dùng bản sao lưu dưới 10 MB.');
  const d: unknown = JSON.parse(raw);
  if (
    !obj(d) ||
    d.version !== 1 ||
    !Array.isArray(d.profiles) ||
    d.profiles.length > 500 ||
    !d.profiles.every(validProfile) ||
    !Array.isArray(d.records) ||
    d.records.length > 20000 ||
    !d.records.every(validRecord) ||
    !obj(d.settings) ||
    typeof d.settings.sound !== 'boolean' ||
    typeof d.settings.reducedMotion !== 'boolean'
  )
    throw new Error('File không phải bản sao lưu Byte Odyssey hợp lệ.');
  const ids = new Set(d.profiles.map((p) => p.id));
  if (
    ids.size !== d.profiles.length ||
    new Set(d.records.map((r) => r.id)).size !== d.records.length ||
    d.records.some((r) => !ids.has(r.profileId)) ||
    (d.selectedProfileId !== null && !ids.has(d.selectedProfileId as string))
  )
    throw new Error('Bản sao lưu có hồ sơ hoặc lượt chơi không nhất quán.');
  // Chỉ nhận các trường đã kiểm tra, không mang metadata lạ vào ứng dụng.
  return {
    version: 1,
    profiles: d.profiles.map((p) => ({
      id: p.id,
      name: p.name,
      classroom: p.classroom,
      createdAt: p.createdAt,
    })),
    records: d.records.map((r) => ({
      ...r,
      selection: {
        group: r.selection.group,
        game: r.selection.game,
        character: r.selection.character,
        map: r.selection.map,
      },
    })),
    selectedProfileId: d.selectedProfileId as string | null,
    settings: { sound: d.settings.sound, reducedMotion: d.settings.reducedMotion },
  };
}
export function loadSave(store?: Store): { data: SaveData; warning: string } {
  try {
    const raw = (store || localStorage).getItem(SAVE_KEY);
    return { data: raw ? parseSave(raw) : emptySave(), warning: '' };
  } catch {
    return {
      data: emptySave(),
      warning:
        'Chưa đọc được hồ sơ đã lưu. Dữ liệu cũ được giữ lại; hãy kiểm tra bản sao lưu hoặc quyền lưu trữ của trình duyệt.',
    };
  }
}
export function writeSave(data: SaveData, store?: Store): string {
  try {
    const target = store || localStorage,
      old = target.getItem(SAVE_KEY);
    if (old) {
      try {
        parseSave(old);
      } catch {
        target.setItem(`${SAVE_KEY}:recovery`, old);
      }
    }
    target.setItem(SAVE_KEY, JSON.stringify(data));
    return '';
  } catch {
    return 'Chưa lưu được vào máy (bộ nhớ đầy hoặc bị chặn). Hãy xuất bản sao lưu trước khi đóng ứng dụng.';
  }
}
export function mergeSave(current: SaveData, incoming: SaveData): SaveData {
  const profiles = [...current.profiles],
    records = [...current.records];
  const profileIds = new Set(profiles.map((p) => p.id)),
    recordIds = new Set(records.map((r) => r.id));
  for (const profile of incoming.profiles)
    if (!profileIds.has(profile.id)) {
      profiles.push(profile);
      profileIds.add(profile.id);
    }
  for (const record of incoming.records)
    if (!recordIds.has(record.id)) {
      records.push(record);
      recordIds.add(record.id);
    }
  return {
    ...current,
    profiles,
    records,
    selectedProfileId: current.selectedProfileId || incoming.selectedProfileId,
  };
}
export function addRecord(data: SaveData, record: PlayRecord): SaveData {
  return data.records.some((r) => r.id === record.id)
    ? data
    : { ...data, records: [...data.records, record] };
}
export function readActive(data: SaveData, store?: Store): Round | null {
  try {
    const raw = (store || localStorage).getItem(ACTIVE_KEY);
    if (!raw) return null;
    const r: unknown = JSON.parse(raw);
    if (
      !obj(r) ||
      !str(r.id, 100) ||
      !data.profiles.some((p) => p.id === r.profileId) ||
      !validSelection(r.selection) ||
      !Array.isArray(r.questionIds) ||
      r.questionIds.length !== 10 ||
      new Set(r.questionIds).size !== 10 ||
      !r.questionIds.every(
        (id) =>
          typeof id === 'string' && questionById.get(id)?.group === (r.selection as Round['selection']).group,
      ) ||
      !integer(r.index, 0, 9) ||
      !integer(r.score, 0, 100) ||
      !integer(r.lives, 1, 3) ||
      !date(r.startedAt) ||
      !validAttempts(r.history) ||
      !['answer', 'wrong', 'correct'].includes(r.phase as string)
    )
      return null;
    return r as unknown as Round;
  } catch {
    return null;
  }
}
export function saveActive(round: Round | null): string {
  try {
    if (round) localStorage.setItem(ACTIVE_KEY, JSON.stringify(round));
    else localStorage.removeItem(ACTIVE_KEY);
    return '';
  } catch {
    return 'Chưa lưu được lượt đang chơi. Hãy hoàn thành và xuất bản sao lưu trước khi đóng.';
  }
}
export function downloadFile(filename: string, content: string, type = 'application/json') {
  const url = URL.createObjectURL(new Blob([content], { type })),
    a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function recordsCSV(data: SaveData): string {
  const cell = (v: unknown) => {
    let s = String(v ?? '');
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return '"' + s.replaceAll('"', '""') + '"';
  };
  const rows: unknown[][] = [
    ['Học sinh', 'Lớp', 'Thời gian', 'Game', 'Nhóm', 'Map', 'Điểm', 'Hoàn thành', 'Kết quả', 'Mục cần luyện'],
  ];
  for (const r of data.records) {
    const p = data.profiles.find((p) => p.id === r.profileId);
    rows.push([
      p?.name,
      p?.classroom,
      r.endedAt,
      gameById(r.selection.game).name,
      groupById(r.selection.group).name,
      mapById(r.selection.game, r.selection.map).name,
      r.score,
      `${r.completed}/10`,
      r.outcome === 'completed' ? 'Hoàn thành' : r.outcome === 'lost' ? 'Hết lượt' : 'Dừng giữa chừng',
      [...new Set(r.history.filter((a) => !a.correct).map((a) => a.target))].join('; '),
    ]);
  }
  return '\uFEFF' + rows.map((row) => row.map(cell).join(',')).join('\r\n');
}
