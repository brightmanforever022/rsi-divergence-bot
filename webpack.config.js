var path = require("path");
var BUILD_DIR = path.resolve(__dirname, "./frontend/public");
var APP_DIR = path.resolve(__dirname, "./frontend/src");

const config = {
   mode: "development",
   entry: {
     main: APP_DIR + "/index.js"
   },
   output: {
     filename: "bundle.js",
     path: BUILD_DIR,
   },

   module: {
   rules: [
     {
       test: /(\.css|.scss)$/,
       use: [{
           loader: "style-loader" // creates style nodes from JS strings
       }, {
           loader: "css-loader" // translates CSS into CommonJS
       }]
     },
     {
       test: /\.(jsx|js)?$/,
       use: [
           {
            loader: "babel-loader",
            options: {
            cacheDirectory: true,
            presets: ["@babel/react", "@babel/preset-env"] // Transpiles JSX and ES6
           }
       }]
     },
     {
        test: /\.svg$/,
        loader: 'svg-inline-loader'
    }
    ],

  }
};

module.exports = config;