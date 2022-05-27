const nodeExternals = require('webpack-node-externals');
const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'index.js'
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: {
                    transpileOnly: true
                }
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js'],
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    externals: [nodeExternals()]
};
