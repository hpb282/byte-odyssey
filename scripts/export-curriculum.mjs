import { QUESTIONS } from '../src/questions.ts';
import { writeFile } from 'node:fs/promises';
await writeFile(
  'docs/hoc-lieu.json',
  JSON.stringify(
    {
      version: 1,
      description: 'Ngữ liệu tiếng Việt tự biên soạn cho Byte Odyssey, dành cho học sinh lớp 2.',
      questions: QUESTIONS,
    },
    null,
    2,
  ) + '\n',
);
console.log('Exported', QUESTIONS.length, 'questions to docs/hoc-lieu.json');
