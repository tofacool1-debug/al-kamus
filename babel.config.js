const config = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['module-resolver', {
      root: ['./'],
      alias: {
        '@': './',
      }
    }]
  ]
};

export default config;
