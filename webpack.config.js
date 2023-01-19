const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const GasWebpackPlugin = require("gas-webpack-plugin");

module.exports = {
  mode: "development",
  context: path.resolve(__dirname, "src"),
  entry: {
    main: "./main.ts",
  },
  module: {
    rules: [
      {
        test: /(\.js|\.ts)$/,
        exclude: /node_modules/,
        loader: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  devtool: "source-map",
  plugins: [
    new GasWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [{ from: "appsscript.json", to: "../dist/appsscript.json" }],
    }),
  ],
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
};
