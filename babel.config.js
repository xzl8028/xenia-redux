// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

module.exports = {
    presets: [
        ['@babel/env', {
            targets: {
                chrome: 66,
                firefox: 60,
                edge: 42,
                ie: 11,
                safari: 12,
            },
            useBuiltIns: 'usage',
            shippedProposals: true,
        }],
    ],
    plugins: [
        '@babel/transform-flow-comments',
        '@babel/proposal-class-properties',
        '@babel/plugin-proposal-optional-chaining',
        ['module-resolver', {
            root: ['./src', '.'],
        }],
    ],
};

