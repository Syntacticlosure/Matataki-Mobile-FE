module.exports = {
  css: {
    loaderOptions: {
      stylus: {
        'resolve url': true,
        import: [],
      },
    },
  },
  pluginOptions: {
    'cube-ui': {
      postCompile: false,
      theme: false,
    },
  },
};
