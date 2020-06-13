// basic vars
const path = require('path')

// additional plugins
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// helping vars
const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev
console.log("isDev: ", isDev)

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const cssLoaders = extra => {
  const loaders = [
    // 'style-loader',                // возможно нужен, пока не разобрался
    {
      loader: MiniCssExtractPlugin.loader,
      options: {
        hmr: isDev,
        reloadAll: true,
        publicPath: '../'             /* для ссылок внутри, например для fonts и bgc-image*/
      },
    },
    'css-loader'
  ]

  if (extra) {
    loaders.push(extra)
  }

  return loaders
}


// module settings
module.exports = {
  // базовый путь к проекту
  context: path.resolve(__dirname, "src"),

  // точка входа (основной файл приложения)
  entry: {
    app: [
      '@babel/polyfill',            // полифил babel
      './app.js'
    ],
  },

  // путь для собранных файлов
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
    // publicPath: "/"                // для dev-server (если включить, то будет преоритетнее, чем 'contentBase' в настройках devServer)
  },

  // dev-server configuration
  devServer: {
    contentBase: 'dist',
    port: 8521,
  },

  // в панеле devtool показывает исходный несжатый код и помогает отслеживать исходные файлы этого кода
  devtool: isDev ? 'source-map' : '',

  // module
  module: {
    rules: [

      // JS + BABEL
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,         // что такое 'bower_components' - имею плохое представление
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },

      // PUG
      {
        test: /\.pug$/,
        // use: ['html-loader?attrs=false', 'pug-html-loader']
        loaders: [
          {
            loader: 'html-loader?attrs=false',
            options: {
              minimize: {
                removeComments: isDev,  // в 'isDev' на выходе будет читабельный html + комментарии
                collapseWhitespace: isDev,  // в 'isDev' на выходе будет читабельный html
              },
            }
          }, {
            loader: 'pug-html-loader',
            options: {
              "pretty": isDev          // в 'isDev' на выходе будет читабельный html
            }
          },
        ]
      },

      // CSS, SASS, SCSS, LESS
      {
        test: /\.css$/i,
        use: cssLoaders()
      },
      //  {
      //   test: /\.less$/i,
      //   use: cssLoaders('less-loader')  // если нужен Less, то надо ставить less-loader и может ещё что-то, гугли
      // }, 
      {
        test: /\.s[ac]ss$/i,
        use: cssLoaders('sass-loader')
      },

      // FONTS
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/i,
        loaders: [
          {
            loader: 'file-loader',
            options: {
              name: 'assets/fonts/[hash].[ext]'
            }
          },
        ]
      },

    ],
  },

  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({       // плагин просто копирует, без какой-либо дополнительной обработки
      patterns: [
        { from: 'assets/images', to: 'assets/images' },
        // { from: 'assets/fonts', to: 'assets/fonts' }
      ],
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.pug',
      //inject: false             // если оставить false, то не будет генерироваться имя с [hash]
    }),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`
      // filename: `./css/main.css`
    }),
  ]
}