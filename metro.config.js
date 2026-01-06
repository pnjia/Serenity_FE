const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const pathsToIgnore = [
  path.resolve(projectRoot, "backend"),
  path.resolve(projectRoot, "app-example"),
];

config.resolver.blockList = new RegExp(
  `(${pathsToIgnore
    .map((dir) => `${escapeRegExp(dir)}(?:/|\\\\).*`)
    .join("|")})`
);

module.exports = config;
