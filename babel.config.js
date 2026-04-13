// Babel is only used by Jest to transform ES module syntax (import/export)
// into CommonJS so Jest (which runs in Node.js) can understand it.
// This file has no effect on the browser — the browser loads utils.js natively.
module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]]
};
