import { describe, expect, it } from 'vitest';
import { createRound, reduceRound, toRecord } from './engine';
import {
  ACTIVE_KEY,
  SAVE_KEY,
  addRecord,
  emptySave,
  loadSave,
  mergeSave,
  parseSave,
  readActive,
  recordsCSV,
  writeSave,
} from './storage';
import type { SaveData } from './types';
function memory() {
  const m = new Map<string, string>();
  return {
    getItem: (key: string) => m.get(key) || null,
    setItem: (key: string, value: string) => {
      m.set(key, value);
    },
    removeItem: (key: string) => {
      m.delete(key);
    },
  };
}
function sample(): SaveData {
  return {
    ...emptySave(),
    profiles: [{ id: 'student', name: 'Minh Anh', classroom: '2A', createdAt: new Date().toISOString() }],
    selectedProfileId: 'student',
  };
}
const round = () =>
  createRound('student', { group: 'letters', game: 'runner', character: 'byte', map: 'forest' });
describe('Hồ sơ và sao lưu', () => {
  it('ghi và đọc lại hồ sơ tiếng Việt cùng cài đặt', () => {
    const store = memory(),
      data = sample();
    data.settings.reducedMotion = true;
    expect(writeSave(data, store)).toBe('');
    expect(loadSave(store)).toEqual({ data, warning: '' });
    expect(parseSave(JSON.stringify(data))).toEqual(data);
  });
  it('file JSON sai phiên bản, map giả hoặc hồ sơ không khớp bị từ chối', () => {
    expect(() => parseSave('{')).toThrow();
    expect(() => parseSave(JSON.stringify({ ...sample(), version: 2 }))).toThrow();
    const record = toRecord(reduceRound(round(), { type: 'abort' }));
    expect(() =>
      parseSave(
        JSON.stringify({
          ...sample(),
          records: [{ ...record, selection: { ...record.selection, map: 'wrong' } }],
        }),
      ),
    ).toThrow();
    expect(() =>
      parseSave(JSON.stringify({ ...sample(), records: [{ ...record, profileId: 'missing' }] })),
    ).toThrow();
    expect(() =>
      parseSave(JSON.stringify({ ...sample(), profiles: [...sample().profiles, ...sample().profiles] })),
    ).toThrow();
  });
  it('không mất bản cũ khi đọc lỗi hoặc bộ nhớ không ghi được', () => {
    const store = memory();
    store.setItem(SAVE_KEY, 'dữ liệu cũ bị lỗi');
    expect(loadSave(store).warning).not.toBe('');
    expect(store.getItem(SAVE_KEY)).toBe('dữ liệu cũ bị lỗi');
    expect(writeSave(sample(), store)).toBe('');
    expect(store.getItem(`${SAVE_KEY}:recovery`)).toBe('dữ liệu cũ bị lỗi');
    const blocked = {
      ...store,
      setItem: () => {
        throw new Error('quota');
      },
    };
    expect(writeSave(emptySave(), blocked)).not.toBe('');
    expect(loadSave(store).data.profiles).toHaveLength(1);
  });
  it('nhập hợp nhất, không nhân đôi lượt chơi hoặc xóa hồ sơ cũ', () => {
    const record = toRecord(reduceRound(round(), { type: 'abort' }));
    let data = addRecord(sample(), record);
    expect(addRecord(data, record)).toBe(data);
    const incoming = {
      ...data,
      profiles: [
        ...data.profiles,
        { id: 'new', name: 'Hà', classroom: '2B', createdAt: new Date().toISOString() },
      ],
    };
    data = mergeSave(data, incoming);
    expect(data.records).toHaveLength(1);
    expect(data.profiles).toHaveLength(2);
    expect(mergeSave(data, incoming)).toEqual(data);
  });
  it('khôi phục đúng lượt đang chơi và không khôi phục dữ liệu hỏng', () => {
    const store = memory(),
      r = round();
    store.setItem(ACTIVE_KEY, JSON.stringify(r));
    expect(readActive(sample(), store)).toEqual(r);
    store.setItem(ACTIVE_KEY, JSON.stringify({ ...r, lives: 0 }));
    expect(readActive(sample(), store)).toBeNull();
    store.setItem(ACTIVE_KEY, JSON.stringify({ ...r, questionIds: Array(10).fill('letters-1') }));
    expect(readActive(sample(), store)).toBeNull();
  });
  it('CSV có tiếng Việt, giữ tên đúng và không thực thi ô công thức từ tên nhập vào', () => {
    const data = sample();
    data.profiles[0].name = '=HYPERLINK("test")';
    data.records = [toRecord(reduceRound(round(), { type: 'abort' }))];
    const csv = recordsCSV(data);
    expect(csv).toContain('Đường chạy phiêu lưu');
    expect(csv).toContain("'=HYPERLINK");
    expect(csv).toContain('Dừng giữa chừng');
  });
});
