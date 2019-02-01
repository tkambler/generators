const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const buildDir = path.resolve(__dirname, 'build');
const publicPath = '/';

module.exports = {
    mode: 'none',
    entry: {
        app: 'app'
    },
    watchOptions: {
        ignored: /node_modules/
    },
    output: {
        path: buildDir,
        filename: 'js/[name].bundle.js'
    },
    resolve: {
        extensions: [
            '.ts', '.tsx', '.js', '.jsx', '.json', '.scss', '.html', '.txt'
        ],
        modules: [
            path.resolve(__dirname, 'node_modules'),
        ],
        alias: {
            app: path.resolve(__dirname, 'src'),
        }
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development')
            }
        }),
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx|js|jsx)$/,
                loader: 'ts-loader'
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'fonts/[name].[ext]',
                            outputPath: buildDir,
                            publicPath: publicPath,
                            emitFile: true
                        }
                    }
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            url: false
                        }
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                        }
                    }
                ]
            }
        ]
    },
    devServer: {
        port: 9000,
        compress: true,
        contentBase: [
            path.resolve(__dirname, 'build'),
            path.resolve(__dirname, 'public'),
        ],
    }
};
