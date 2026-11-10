import type { CharacterId, GameId, GroupId } from './types';

export const GROUPS: { id: GroupId; name: string; description: string; symbol: string; color: string }[] = [
  { id: 'letters', name: 'Nhận diện chữ', description: 'Chọn chữ còn thiếu', symbol: 'A B C', color: 'blue' },
  {
    id: 'syllables',
    name: 'Vần và dấu thanh',
    description: 'Ghép vần, chọn dấu',
    symbol: 'a á',
    color: 'green',
  },
  {
    id: 'words',
    name: 'Ghép từ và câu',
    description: 'Ghép từ, nối tranh, xếp câu',
    symbol: 'học sinh',
    color: 'purple',
  },
];
export const CHARACTERS: { id: CharacterId; name: string; color: string }[] = [
  { id: 'mascot', name: 'Linh vật', color: '#e9885d' },
  { id: 'byte', name: 'Robot Byte', color: '#35bdf1' },
  { id: 'cat', name: 'Mèo', color: '#ba8de9' },
  { id: 'rabbit', name: 'Thỏ', color: '#fff0d6' },
  { id: 'bear', name: 'Gấu', color: '#c8904c' },
  { id: 'fox', name: 'Cáo', color: '#ffad34' },
  { id: 'frog', name: 'Ếch', color: '#79d898' },
  { id: 'penguin', name: 'Chim cánh cụt', color: '#40509a' },
  { id: 'sprout', name: 'Mầm', color: '#e98255' },
  { id: 'star', name: 'Sao', color: '#ffe34b' },
];
export interface MapTheme {
  id: string;
  name: string;
  sky: string;
  distant: string;
  ground: string;
  top: string;
  accent: string;
  theme: string;
}
const m = (
  id: string,
  name: string,
  sky: string,
  distant: string,
  ground: string,
  top: string,
  accent: string,
  theme: string,
): MapTheme => ({ id, name, sky, distant, ground, top, accent, theme });
export const GAMES: {
  id: GameId;
  name: string;
  description: string;
  action: string;
  symbol: string;
  maps: MapTheme[];
}[] = [
  {
    id: 'runner',
    name: 'Đường chạy phiêu lưu',
    description: 'Vượt chướng ngại vật',
    action: 'Nhảy qua',
    symbol: '↗',
    maps: [
      m('forest', 'Rừng xanh', '#b2ebfa', '#66bdb1', '#b87d4f', '#8ddd59', '#4ca46c', 'forest'),
      m('candy', 'Vườn kẹo', '#ffd0e8', '#efa8cd', '#d9a47c', '#c6a4ef', '#f98fb5', 'candy'),
      m('cloud', 'Đảo mây', '#ffdec5', '#c9b2e4', '#9187bb', '#a5d975', '#fbf6ee', 'cloud'),
      m('desert', 'Sa mạc nắng', '#b1ecf5', '#e6b778', '#ca8b5e', '#f5d081', '#f0b354', 'desert'),
      m('snow', 'Thung lũng băng', '#f6dbea', '#b3bbde', '#7389b8', '#f4f7ff', '#b8d7f2', 'snow'),
    ],
  },
  {
    id: 'space',
    name: 'Phi thuyền không gian',
    description: 'Bắn thiên thạch',
    action: 'Bắn',
    symbol: '✦',
    maps: [
      m('galaxy', 'Ngân hà tím', '#251f56', '#59409b', '#9a79d5', '#bd9be7', '#e1c1ff', 'galaxy'),
      m('nebula', 'Tinh vân hồng', '#48214f', '#8e3986', '#c477b3', '#f0b0d1', '#f5a2d4', 'nebula'),
      m('earth', 'Quỹ đạo Trái Đất', '#122e59', '#306ab5', '#789acc', '#c2dcf8', '#75d0e8', 'earth'),
      m('saturn', 'Vành đai Sao Thổ', '#3b2c2a', '#816242', '#d5a569', '#f5d79a', '#efc16c', 'saturn'),
      m('ice', 'Tinh cầu băng', '#163c61', '#3c8ba8', '#7fcce1', '#bdeeff', '#c1f7ff', 'ice'),
      m('lava', 'Hành tinh lửa', '#472431', '#a74b45', '#cf7656', '#ffc08d', '#f48d55', 'lava'),
    ],
  },
  {
    id: 'race',
    name: 'Đường đua kỳ thú',
    description: 'Đua xe qua trạm',
    action: 'Tăng tốc',
    symbol: '⚑',
    maps: [
      m('park', 'Công viên xanh', '#b1eafa', '#80c7ad', '#81c86a', '#9bdb69', '#69b75b', 'forest'),
      m('coast', 'Đường đua ven biển', '#b4eefa', '#7cd2df', '#f4d998', '#ffedc7', '#55b8db', 'coast'),
      m('town', 'Phố sắc màu', '#b5e7f8', '#d6badc', '#d6cddd', '#eee1ce', '#c597e2', 'town'),
      m('village', 'Làng quê Việt', '#b7edfa', '#6dbdac', '#d9bd4d', '#f4df78', '#df8770', 'village'),
      m('winter', 'Thung lũng tuyết', '#f9dce9', '#a8b5d9', '#d5e5f5', '#f5faff', '#8ec6eb', 'snow'),
      m('sweet', 'Xứ sở kẹo', '#ffd2e8', '#eaa1cb', '#f6d1dc', '#fff0e2', '#ed98bd', 'candy'),
    ],
  },
  {
    id: 'climb',
    name: 'Leo núi tìm sao',
    description: 'Leo lên tìm sao',
    action: 'Leo lên',
    symbol: '★',
    maps: [
      m('mountain', 'Núi rừng xanh', '#b4edfa', '#72b8bb', '#a78160', '#99d85f', '#659f70', 'forest'),
      m('tree', 'Cây cổ thụ', '#c2edb7', '#83b897', '#ac7848', '#d9ac72', '#89bc66', 'tree'),
      m('sky', 'Đỉnh mây', '#ffdfd6', '#d9c9ed', '#c7b6da', '#fff0d8', '#d5a9ee', 'cloud'),
      m('snowpeak', 'Núi tuyết', '#dbe4fa', '#adb8dc', '#8095b4', '#f5f8ff', '#c0e5f9', 'snow'),
      m('crystal', 'Hang tinh thể', '#302743', '#574068', '#73528b', '#b68bd6', '#67e3e0', 'crystal'),
      m('cake', 'Tháp bánh kẹo', '#ffdeed', '#f3b4d0', '#d1a679', '#f3a0c2', '#fff0c8', 'candy'),
    ],
  },
];
export const gameById = (id: GameId) => GAMES.find((game) => game.id === id)!;
export const groupById = (id: GroupId) => GROUPS.find((group) => group.id === id)!;
export const characterById = (id: CharacterId) => CHARACTERS.find((character) => character.id === id)!;
export const mapById = (game: GameId, id: string) => gameById(game).maps.find((map) => map.id === id)!;
