module.exports = function (api) {
  api.cache(true);

  const presets = [["@babel/preset-env", {
      targets: {
        chrome: "68",
        firefox: "62",
      },
    }]];

  return {
    presets,
    sourceType: "unambiguous",
  };
}
