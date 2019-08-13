const webpack = require("webpack");
const path = require("path");

module.exports = {
  module: "commonjs",
  target: "node",
  entry: "./src/cli/index.ts",
  mode: "development",
  devtool: "inline-source-map",
  plugins: [
    new webpack.BannerPlugin({ banner: "#!/usr/bin/env node", raw: true })
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "cacti-script.js",
    path: path.resolve(__dirname, "dist")
  }
};
