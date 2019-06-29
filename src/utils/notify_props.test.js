// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';

import {Preferences} from 'constants';
import {getEmailInterval} from 'utils/notify_props';

describe('user utils', () => {
    it('should return username', () => {
        const testCases = [
            {enableEmail: false, enableBatching: true, intervalPreference: Preferences.INTERVAL_IMMEDIATE, out: Preferences.INTERVAL_NEVER},

            {enableEmail: true, enableBatching: true, out: Preferences.INTERVAL_FIFTEEN_MINUTES},
            {enableEmail: true, enableBatching: true, intervalPreference: Preferences.INTERVAL_IMMEDIATE, out: Preferences.INTERVAL_IMMEDIATE},
            {enableEmail: true, enableBatching: true, intervalPreference: Preferences.INTERVAL_NEVER, out: Preferences.INTERVAL_NEVER},
            {enableEmail: true, enableBatching: true, intervalPreference: Preferences.INTERVAL_FIFTEEN_MINUTES, out: Preferences.INTERVAL_FIFTEEN_MINUTES},
            {enableEmail: true, enableBatching: true, intervalPreference: Preferences.INTERVAL_HOUR, out: Preferences.INTERVAL_HOUR},

            {enableEmail: true, enableBatching: false, out: Preferences.INTERVAL_IMMEDIATE},
            {enableEmail: true, enableBatching: false, intervalPreference: Preferences.INTERVAL_IMMEDIATE, out: Preferences.INTERVAL_IMMEDIATE},
            {enableEmail: true, enableBatching: false, intervalPreference: Preferences.INTERVAL_NEVER, out: Preferences.INTERVAL_NEVER},
            {enableEmail: true, enableBatching: false, intervalPreference: Preferences.INTERVAL_FIFTEEN_MINUTES, out: Preferences.INTERVAL_IMMEDIATE},
            {enableEmail: true, enableBatching: false, intervalPreference: Preferences.INTERVAL_HOUR, out: Preferences.INTERVAL_IMMEDIATE},
        ];

        testCases.forEach((testCase) => {
            assert.equal(getEmailInterval(testCase.enableEmail, testCase.enableBatching, testCase.intervalPreference), testCase.out, `getEmailInterval(${testCase.enableEmail}, ${testCase.enableBatching}, ${testCase.intervalPreference}) should return ${testCase.out}`);
        });
    });
});
