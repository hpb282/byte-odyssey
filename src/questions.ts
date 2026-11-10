import type { ChoiceQuestion, GroupId, MatchQuestion, OrderQuestion, Question } from './types';

// Ngữ liệu gốc, tự biên soạn; không sao chép bài đọc từ sách giáo khoa.
// Mỗi hàng có ngữ cảnh và gợi ý riêng để hạn chế đáp án mơ hồ.
type LetterRow = [string, string, string, string, string, string, string];
const letters: LetterRow[] = [
  ['lá cây', '_á cây', 'l', 'n', 's', '🍃', 'Lá cây bắt đầu bằng chữ l.'],
  ['nón lá', '_ón lá', 'n', 'l', 'm', '👒', 'Chiếc nón bắt đầu bằng chữ n.'],
  ['lớp học', '_ớp học', 'l', 'n', 's', '🏫', 'Lớp học bắt đầu bằng chữ l.'],
  ['ngọn núi', '_ọn núi', 'ng', 'ngh', 'g', '⛰️', 'Ng đi với nguyên âm o trong tiếng ngọn.'],
  ['sông suối', '_ông suối', 's', 'x', 'ch', '🏞️', 'Sông được viết với s.'],
  ['xe đạp', '_e đạp', 'x', 's', 'ch', '🚲', 'Xe được viết với x.'],
  ['con chim', 'con _im', 'ch', 'tr', 'th', '🐦', 'Chim bắt đầu bằng ch.'],
  ['con trâu', 'con _âu', 'tr', 'ch', 'th', '🐃', 'Trâu bắt đầu bằng tr.'],
  ['rổ rau', '_ổ rau', 'r', 'd', 'gi', '🥬', 'Rổ bắt đầu bằng r.'],
  ['cái giỏ', 'cái _ỏ', 'gi', 'd', 'r', '🧺', 'Giỏ bắt đầu bằng gi.'],
  ['đôi dép', 'đôi _ép', 'd', 'gi', 'r', '🩴', 'Dép được viết với d.'],
  ['cá vàng', '_á vàng', 'c', 'k', 'q', '🐠', 'Cá được viết với c.'],
  ['con kiến', 'con _iến', 'k', 'c', 'q', '🐜', 'K thường đi trước i, e, ê.'],
  ['gà con', '_à con', 'g', 'gh', 'ng', '🐥', 'Gà bắt đầu bằng g, không có h.'],
  ['ghế gỗ', '_ế gỗ', 'gh', 'g', 'ngh', '🪑', 'Gh thường đi trước e, ê, i.'],
  ['ngôi nhà', '_ôi nhà', 'ng', 'ngh', 'g', '🏠', 'Ngôi bắt đầu bằng ng.'],
  ['con nghé', 'con _é', 'ngh', 'ng', 'gh', '🐃', 'Ngh đi trước e, ê, i.'],
  ['quả cam', '_uả cam', 'q', 'c', 'k', '🍊', 'Chữ q đi cùng u để viết quả.'],
  ['mùa thu', 'mùa _u', 'th', 't', 'ph', '🍂', 'Thu bắt đầu bằng th.'],
  ['thổi sáo', '_ổi sáo', 'th', 't', 'kh', '🎶', 'Thổi bắt đầu bằng th.'],
  ['phượng vĩ', '_ượng vĩ', 'ph', 'p', 'th', '🌺', 'Phượng bắt đầu bằng ph.'],
  ['bông hồng', '_ông hồng', 'b', 'v', 'p', '🌹', 'Bông bắt đầu bằng b.'],
  ['vườn hoa', '_ườn hoa', 'v', 'b', 'd', '🌷', 'Vườn bắt đầu bằng v.'],
  ['mặt trời', '_ặt trời', 'm', 'n', 'b', '☀️', 'Mặt bắt đầu bằng m.'],
  ['bạn nhỏ', '_ạn nhỏ', 'b', 'v', 'p', '🧒', 'Bạn bắt đầu bằng b.'],
  ['quả khế', 'quả _ế', 'kh', 'k', 'gh', '⭐', 'Khế bắt đầu bằng kh.'],
  ['khóm tre', '_óm tre', 'kh', 'ch', 'th', '🎋', 'Khóm bắt đầu bằng kh.'],
  ['nhành hoa', '_ành hoa', 'nh', 'n', 'h', '🌼', 'Nhành bắt đầu bằng nh.'],
  ['chăm chỉ', '_ăm chỉ', 'ch', 'tr', 'th', '📚', 'Chăm được viết với ch.'],
  ['trực nhật', '_ực nhật', 'tr', 'ch', 'th', '🧹', 'Trực được viết với tr.'],
  ['xếp hàng', '_ếp hàng', 'x', 's', 'ch', '🧍', 'Xếp được viết với x.'],
  ['sạch sẽ', '_ạch sẽ', 's', 'x', 'ch', '🧼', 'Sạch được viết với s.'],
  ['đàn vịt', 'đàn _ịt', 'v', 'b', 'd', '🦆', 'Vịt bắt đầu bằng v.'],
  ['mẹ hiền', 'mẹ _iền', 'h', 'kh', 'nh', '💛', 'Hiền bắt đầu bằng h.'],
  ['con hươu', 'con _ươu', 'h', 'kh', 'ph', '🦌', 'Hươu bắt đầu bằng h.'],
  ['quả táo', 'quả _áo', 't', 'th', 'tr', '🍎', 'Táo bắt đầu bằng t.'],
  ['cánh diều', 'cánh _iều', 'd', 'gi', 'r', '🪁', 'Diều được viết với d.'],
  ['bàn tay', '_àn tay', 'b', 'v', 'd', '🖐️', 'Bàn bắt đầu bằng b.'],
  ['nụ cười', 'nụ _ười', 'c', 'k', 'g', '😊', 'Cười được viết với c.'],
  ['nghỉ hè', '_ỉ hè', 'ngh', 'ng', 'gh', '🏖️', 'Ngh đi trước i trong tiếng nghỉ.'],
];
const letterQuestions: ChoiceQuestion[] = letters.map(
  ([target, stem, correct, a, b, illustration, hint], i) => ({
    id: `letters-${i + 1}`,
    group: 'letters',
    type: 'choice',
    prompt: 'Chọn chữ còn thiếu theo cụm từ và hình gợi ý.',
    stem,
    target,
    correct,
    options: [correct, a, b],
    illustration,
    hint,
    topic: 'Chữ và phụ âm',
  }),
);

type RhymeRow = [string, string, string, string, string, string];
const rhymes: RhymeRow[] = [
  ['m', 'èo', 'eo', 'âu', 'mèo', '🐱'],
  ['ch', 'ó', 'o', 'ỏ', 'chó', '🐶'],
  ['b', 'ướm', 'ươm', 'ươn', 'bướm', '🦋'],
  ['c', 'á', 'à', 'ả', 'cá', '🐟'],
  ['v', 'ịt', 'it', 'ít', 'vịt', '🦆'],
  ['t', 'áo', 'ao', 'ào', 'táo', '🍎'],
  ['ch', 'anh', 'ach', 'ang', 'chanh', '🍋'],
  ['c', 'am', 'an', 'ang', 'cam', '🍊'],
  ['h', 'oa', 'ao', 'oà', 'hoa', '🌼'],
  ['s', 'ách', 'ach', 'ánh', 'sách', '📚'],
  ['b', 'út', 'ut', 'ụt', 'bút', '✏️'],
  ['th', 'ước', 'ươc', 'ướt', 'thước', '📏'],
  ['c', 'ây', 'ay', 'ầy', 'cây', '🌳'],
  ['m', 'ưa', 'ư', 'ươ', 'mưa', '🌧️'],
  ['n', 'ắng', 'ăng', 'ánh', 'nắng', '☀️'],
  ['tr', 'ăng', 'ang', 'âng', 'trăng', '🌙'],
  ['b', 'iển', 'iên', 'iến', 'biển', '🌊'],
  ['th', 'uyền', 'uyên', 'uyến', 'thuyền', '⛵'],
  ['đ', 'èn', 'en', 'ền', 'đèn', '💡'],
  ['tr', 'ống', 'ông', 'ổng', 'trống', '🥁'],
];
const rhymeQuestions: ChoiceQuestion[] = rhymes.map(([prefix, correct, a, b, target, illustration], i) => ({
  id: `rhyme-${i + 1}`,
  group: 'syllables',
  type: 'choice',
  prompt: `Chọn phần còn thiếu để viết tiếng “${target}”.`,
  stem: `${prefix} + ?`,
  target,
  correct,
  options: [correct, a, b],
  illustration,
  hint: `${prefix} ghép với ${correct} thành ${target}.`,
  topic: 'Ghép vần',
}));
type ToneRow = [string, string, string, string, string];
const tones: ToneRow[] = [
  ['Em bé đang __.', 'ngủ', 'ngũ', 'ngụ', '😴'],
  ['Bé tô màu __.', 'đỏ', 'đõ', 'đò', '🟥'],
  ['Trên trời có đám __.', 'mây', 'mấy', 'mầy', '☁️'],
  ['Em uống một cốc __.', 'sữa', 'sửa', 'sứa', '🥛'],
  ['Cô giáo đang __ bài.', 'giảng', 'giãng', 'giàng', '👩‍🏫'],
  ['Mẹ mua một __ rau.', 'mớ', 'mờ', 'mở', '🥬'],
  ['Bố mở __ sổ.', 'cửa', 'cữa', 'cứa', '🪟'],
  ['Bông __ nở rộ.', 'hoa', 'hòa', 'hóa', '🌼'],
  ['Em cất sách vào __.', 'tủ', 'tũ', 'tú', '📚'],
  ['Em chăm chỉ __ bài.', 'học', 'hóc', 'hộc', '📖'],
  ['Con __ đang bơi.', 'cá', 'cà', 'cả', '🐟'],
  ['Em bé nằm trên __.', 'võng', 'vỏng', 'vọng', '😴'],
  ['Mẹ đưa em đến __.', 'trường', 'trướng', 'trưởng', '🏫'],
  ['Em __ cô giáo.', 'chào', 'cháo', 'chảo', '👋'],
  ['Bà kể __ cổ tích.', 'chuyện', 'chuyển', 'chuyền', '📖'],
  ['Chúng em __ cây.', 'tưới', 'tười', 'tưởi', '🌱'],
  ['Lớp học luôn __ sẽ.', 'sạch', 'sách', 'sánh', '🧹'],
  ['Em __ răng mỗi sáng.', 'đánh', 'đành', 'đảnh', '🪥'],
  ['Em __ mẹ làm việc nhà.', 'giúp', 'giụp', 'giủp', '💛'],
  ['Bé __ đầu chào bà.', 'cúi', 'cùi', 'củi', '🙇'],
];
const toneQuestions: ChoiceQuestion[] = tones.map(([stem, correct, a, b, illustration], i) => ({
  id: `tone-${i + 1}`,
  group: 'syllables',
  type: 'choice',
  prompt: 'Chọn tiếng đúng để hoàn thành câu.',
  stem,
  target: correct,
  correct,
  options: [correct, a, b],
  illustration,
  hint: `Đọc cả câu với tiếng “${correct}”. Chú ý dấu thanh.`,
  topic: 'Nhận diện dấu thanh',
}));

type WordRow = [string, string, string, string, string];
const compounds: WordRow[] = [
  ['học', 'sinh', 'bàn', 'mưa', '🧒'],
  ['sân', 'trường', 'mưa', 'bút', '🏫'],
  ['gia', 'đình', 'cây', 'bút', '🏠'],
  ['ông', 'bà', 'áo', 'bút', '👵'],
  ['bạn', 'bè', 'nước', 'lá', '🧒'],
  ['thầy', 'cô', 'bánh', 'bút', '👩‍🏫'],
  ['bút', 'chì', 'mây', 'bàn', '✏️'],
  ['bảng', 'đen', 'cơm', 'trăng', '⬛'],
  ['đôi', 'giày', 'trời', 'cây', '👟'],
  ['bàn', 'học', 'mưa', 'cười', '🪑'],
  ['vườn', 'hoa', 'sách', 'bút', '🌷'],
  ['cây', 'xanh', 'giày', 'cháo', '🌳'],
  ['mặt', 'trời', 'vở', 'kẹo', '☀️'],
  ['đèn', 'lồng', 'vịt', 'bút', '🏮'],
  ['bánh', 'mì', 'cây', 'sông', '🥖'],
];
const compoundQuestions: ChoiceQuestion[] = compounds.map(([prefix, correct, a, b, illustration], i) => ({
  id: `word-${i + 1}`,
  group: 'words',
  type: 'choice',
  prompt: 'Ghép hai tiếng thành từ hoặc cụm từ phù hợp.',
  stem: `${prefix} + ?`,
  target: `${prefix} ${correct}`,
  correct,
  options: [correct, a, b],
  illustration,
  hint: `${prefix} ghép với ${correct} thành “${prefix} ${correct}”.`,
  topic: 'Ghép từ',
}));
const sentences: [string[], string][] = [
  [['Em', 'đi', 'học.'], '🎒'],
  [['Em', 'yêu', 'gia đình.'], '🏠'],
  [['Bé', 'tưới', 'cây.'], '🌱'],
  [['Mẹ', 'đọc', 'sách.'], '📖'],
  [['Bố', 'nấu', 'cơm.'], '🍚'],
  [['Em', 'chào', 'thầy cô.'], '👋'],
  [['Bạn Lan', 'chăm chỉ', 'học bài.'], '✏️'],
  [['Chúng em', 'giữ lớp', 'sạch đẹp.'], '🧹'],
  [['Em', 'rửa tay', 'trước khi ăn.'], '🧼'],
  [['Cô giáo', 'kể chuyện', 'cho chúng em nghe.'], '📚'],
  [['Bé', 'nhặt rác', 'bỏ vào', 'thùng.'], '🗑️'],
  [['Cây', 'trong vườn', 'xanh tốt.'], '🌳'],
  [['Em', 'giúp mẹ', 'quét nhà.'], '🧹'],
  [['Buổi sáng,', 'em', 'đánh răng.'], '🪥'],
  [['Các bạn', 'cùng chơi', 'nhảy dây.'], '🧒'],
];
const orderQuestions: OrderQuestion[] = sentences.map(([tokens, illustration], i) => ({
  id: `sentence-${i + 1}`,
  group: 'words',
  type: 'order',
  prompt: 'Sắp xếp các mảnh thành câu hoàn chỉnh.',
  tokens,
  correct: tokens,
  target: tokens.join(' '),
  illustration,
  hint: `Câu bắt đầu bằng “${tokens[0]}” và kết thúc bằng “${tokens.at(-1)}”.`,
  topic: 'Xếp câu',
}));
const matchSets: [string, [string, string][]][] = [
  [
    'Con vật',
    [
      ['con mèo', '🐱'],
      ['con chó', '🐶'],
      ['con thỏ', '🐰'],
      ['con ếch', '🐸'],
    ],
  ],
  [
    'Đồ dùng học tập',
    [
      ['bút chì', '✏️'],
      ['quyển sách', '📖'],
      ['thước kẻ', '📏'],
      ['cặp sách', '🎒'],
    ],
  ],
  [
    'Trái cây',
    [
      ['quả táo', '🍎'],
      ['quả chuối', '🍌'],
      ['quả cam', '🍊'],
      ['dưa hấu', '🍉'],
    ],
  ],
  [
    'Bầu trời',
    [
      ['cơn mưa', '🌧️'],
      ['mặt trời', '☀️'],
      ['đám mây', '☁️'],
      ['cầu vồng', '🌈'],
    ],
  ],
  [
    'Phương tiện',
    [
      ['ô tô', '🚗'],
      ['xe đạp', '🚲'],
      ['tàu thủy', '🚢'],
      ['máy bay', '✈️'],
    ],
  ],
  [
    'Thiên nhiên',
    [
      ['cây xanh', '🌳'],
      ['chiếc lá', '🍃'],
      ['bông hoa', '🌼'],
      ['ngọn núi', '⛰️'],
    ],
  ],
  [
    'Cơ thể',
    [
      ['bàn tay', '🖐️'],
      ['cái tai', '👂'],
      ['con mắt', '👁️'],
      ['cái mũi', '👃'],
    ],
  ],
  [
    'Thức ăn',
    [
      ['bánh mì', '🥖'],
      ['bát cơm', '🍚'],
      ['quả trứng', '🥚'],
      ['cốc sữa', '🥛'],
    ],
  ],
  [
    'Âm nhạc',
    [
      ['cái trống', '🥁'],
      ['đàn ghi ta', '🎸'],
      ['cái kèn', '🎺'],
      ['nốt nhạc', '🎵'],
    ],
  ],
  [
    'Vui chơi',
    [
      ['bóng đá', '⚽'],
      ['cầu lông', '🏸'],
      ['bóng rổ', '🏀'],
      ['cánh diều', '🪁'],
    ],
  ],
];
const matchQuestions: MatchQuestion[] = matchSets.map(([topic, items], i) => ({
  id: `match-${i + 1}`,
  group: 'words',
  type: 'match',
  prompt: 'Nối mỗi từ với đúng hình.',
  topic,
  pairs: items.map(([word, picture], j) => ({ id: `pair-${j}`, word, picture })),
  target: items.map(([word]) => word).join(', '),
  hint: `Ví dụ: ${items[0][1]} là ${items[0][0]}. Chọn từ bên trái rồi chọn hình bên phải.`,
}));

export const QUESTIONS: Question[] = [
  ...letterQuestions,
  ...rhymeQuestions,
  ...toneQuestions,
  ...compoundQuestions,
  ...orderQuestions,
  ...matchQuestions,
];
export const questionById = new Map(QUESTIONS.map((question) => [question.id, question]));
export const questionsFor = (group: GroupId) => QUESTIONS.filter((question) => question.group === group);

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export function createDeck(group: GroupId, random: () => number = Math.random): string[] {
  const pool = questionsFor(group);
  // Với nhóm từ/câu, mỗi lượt đều có bài chọn, xếp câu và nối tranh.
  if (group === 'words')
    return shuffled(
      [
        ...shuffled(
          pool.filter((q) => q.type === 'choice'),
          random,
        ).slice(0, 4),
        ...shuffled(
          pool.filter((q) => q.type === 'order'),
          random,
        ).slice(0, 3),
        ...shuffled(
          pool.filter((q) => q.type === 'match'),
          random,
        ).slice(0, 3),
      ],
      random,
    ).map((q) => q.id);
  if (group === 'syllables')
    return shuffled(
      [
        ...shuffled(
          pool.filter((q) => q.topic === 'Ghép vần'),
          random,
        ).slice(0, 5),
        ...shuffled(
          pool.filter((q) => q.topic === 'Nhận diện dấu thanh'),
          random,
        ).slice(0, 5),
      ],
      random,
    ).map((q) => q.id);
  return shuffled(pool, random)
    .slice(0, 10)
    .map((q) => q.id);
}
