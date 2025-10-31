export default {
  '*.md': 'prettier --write',
  '*.json': 'prettier --write',
  '*.ts': (filenames) => [...filenames.map((filename) => `prettier --write ${filename}`)],
};
