export default {
  '**/*.{js,jsx,ts,tsx,mjs,mts}': ['eslint --flag unstable_config_lookup_from_file --fix', 'prettier --write'],
};
