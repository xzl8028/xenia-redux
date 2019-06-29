// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
const path = require('path');
const UglifyPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: {
        client4: './src/client/client4.js',
        websocket: './src/client/websocket_client.js',
    },
    output: {
        path: path.resolve(__dirname, 'lib'),
        library: ['Xenia', '[name]'],
        filename: 'xenia.[name].js',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: 'babel-loader',
            },
        ],
    },
    plugins: [
        new UglifyPlugin({sourceMap: true}),
    ],
    devtool: 'source-map',
};
