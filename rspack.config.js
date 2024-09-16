import path from "node:path";
import rspack from "@rspack/core";

const isProduction = process.env.NODE_ENV === "production";

export default {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? false : undefined,
  entry: {
    index: "./src/index.tsx",
  },
  output: {
    path: path.resolve(import.meta.dirname, "dist"),
    filename: isProduction ? `[name].js` : `[name].[contenthash:7].js`,
    clean: true,
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/i,
        exclude: /node_modules/,
        loader: "builtin:swc-loader",
        options: {
          sourceMap: true,
          jsc: {
            parser: {
              syntax: "typescript",
              jsx: true,
            },
            transform: {
              react: {
                runtime: "automatic",
              },
            },
          },
        },
        type: "javascript/auto",
      },
      {
        test: /\.css$/i,
        use: [
          rspack.CssExtractRspackPlugin.loader,
          {
            loader: "css-loader",
            options: {
              modules: {
                auto: /\.(module|m)\.css$/i,
                exportLocalsConvention: "as-is",
                namedExport: false,
                localIdentName: isProduction
                  ? "mtrxn_[hash:7]"
                  : "[name]__[local]--[hash:3]",
              },
            },
          },
        ],
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        use: [
          {
            loader: "@svgr/webpack",
            options: {
              svgoConfig: {
                plugins: [
                  {
                    name: "preset-default",
                    params: {
                      overrides: {
                        cleanupIds: false,
                        removeViewBox: false,
                        collapseGroups: false,
                      },
                    },
                  },
                  { name: "mergePaths" },
                  { name: "prefixIds" },
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.(apng|avif|gif|jpg|jpeg|png|webp)$/i,
        type: "asset",
      },
    ],
  },
  plugins: [
    new rspack.CssExtractRspackPlugin({
      filename: isProduction ? `[name].css` : `[name].[contenthash:7].css`,
    }),
    new rspack.CopyRspackPlugin({
      patterns: [
        {
          from: "public",
          to: "public",
          noErrorOnMissing: true,
        },
      ],
    }),
    new rspack.HtmlRspackPlugin({
      template: "./src/index.html",
      scriptLoading: "module",
      inject: "body",
      minify: isProduction,
    }),
  ],
  experiments: {
    css: false,
    outputModule: true,
  },
  devServer: {
    port: 3600,
    historyApiFallback: true,
    host: "0.0.0.0",
    hot: false,
    liveReload: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
};
