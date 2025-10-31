export default {
  '**/*.{js,jsx,ts,tsx,mjs,mts}': [
    'bash -c tsc --noEmit',
    'eslint --flag unstable_config_lookup_from_file --fix',
    'prettier --write',
  ],
  '**/*.{json,md}': ['prettier --write'],
};
