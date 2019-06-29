// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import nock from 'nock';

import {GeneralTypes} from 'action_types';
import * as Actions from 'actions/general';
import {Client4} from 'client';
import {RequestStatus} from 'constants';

import TestHelper from 'test/test_helper';
import configureStore from 'test/test_store';

describe('Actions.General', () => {
    let store;
    beforeAll(async () => {
        await TestHelper.initBasic(Client4);
    });

    beforeEach(async () => {
        store = await configureStore();
    });

    afterAll(async () => {
        await TestHelper.tearDown();
    });

    it('getPing - Invalid URL', async () => {
        const serverUrl = Client4.getUrl();
        Client4.setUrl('notarealurl');
        await Actions.getPing(true)(store.dispatch, store.getState);

        const {server} = store.getState().requests.general;
        assert.ok(server.status === RequestStatus.FAILURE && server.error);
        Client4.setUrl(serverUrl);
    });

    it('getPing', async () => {
        nock(Client4.getBaseRoute()).
            get('/system/ping').
            query(true).
            reply(200, {status: 'OK', version: '4.0.0'});

        await Actions.getPing()(store.dispatch, store.getState);

        const {server} = store.getState().requests.general;
        if (server.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(server.error));
        }
    });

    it('getClientConfig', async () => {
        nock(Client4.getBaseRoute()).
            get('/config/client').
            query(true).
            reply(200, {Version: '4.0.0', BuildNumber: '3', BuildDate: 'Yesterday', BuildHash: '1234'});

        await Actions.getClientConfig()(store.dispatch, store.getState);

        const configRequest = store.getState().requests.general.config;
        if (configRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(configRequest.error));
        }

        const clientConfig = store.getState().entities.general.config;

        // Check a few basic fields since they may change over time
        assert.ok(clientConfig.Version);
        assert.ok(clientConfig.BuildNumber);
        assert.ok(clientConfig.BuildDate);
        assert.ok(clientConfig.BuildHash);
    });

    it('getLicenseConfig', async () => {
        nock(Client4.getBaseRoute()).
            get('/license/client').
            query(true).
            reply(200, {IsLicensed: 'false'});

        await Actions.getLicenseConfig()(store.dispatch, store.getState);

        const licenseRequest = store.getState().requests.general.license;
        if (licenseRequest.status === RequestStatus.FAILURE) {
            throw new Error(JSON.stringify(licenseRequest.error));
        }

        const licenseConfig = store.getState().entities.general.license;

        // Check a few basic fields since they may change over time
        assert.notStrictEqual(licenseConfig.IsLicensed, undefined);
    });

    it('setServerVersion', async () => {
        const version = '3.7.0';
        await Actions.setServerVersion(version)(store.dispatch, store.getState);
        await TestHelper.wait(100);
        const {serverVersion} = store.getState().entities.general;
        assert.deepEqual(serverVersion, version);
    });

    it('getDataRetentionPolicy', async () => {
        const responseData = {
            message_deletion_enabled: true,
            file_deletion_enabled: false,
            message_retention_cutoff: Date.now(),
            file_retention_cutoff: 0,
        };

        nock(Client4.getBaseRoute()).
            get('/data_retention/policy').
            query(true).
            reply(200, responseData);

        await Actions.getDataRetentionPolicy()(store.dispatch, store.getState);
        await TestHelper.wait(100);
        const {dataRetentionPolicy} = store.getState().entities.general;
        assert.deepEqual(dataRetentionPolicy, responseData);
    });

    it('getTimezones', async () => {
        nock(Client4.getBaseRoute()).
            get('/system/timezones').
            query(true).
            reply(200, ['America/New_York', 'America/Los_Angeles']);

        await Actions.getSupportedTimezones()(store.dispatch, store.getState);

        await TestHelper.wait(100);
        const {timezones} = store.getState().entities.general;
        assert.equal(timezones.length > 0, true);
        assert.equal(timezones.length === 0, false);
    });

    describe('getRedirectLocation', () => {
        it('new server', async () => {
            store.dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: '5.3.0'});

            const mock = nock(Client4.getBaseRoute()).
                get('/redirect_location').
                query({url: 'http://examp.le'}).
                reply(200, '{"location": "https://example.com"}');

            let requestStatus = store.getState().requests.general.redirectLocation.status;
            assert.equal(requestStatus, RequestStatus.NOT_STARTED);

            // Should have followed the link
            const result = await store.dispatch(Actions.getRedirectLocation('http://examp.le'));
            assert.deepEqual(result.data, {location: 'https://example.com'});

            requestStatus = store.getState().requests.general.redirectLocation.status;
            assert.equal(requestStatus, RequestStatus.SUCCESS);

            assert.equal(mock.isDone(), true);
        });

        it('old server', async () => {
            store.dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: '5.0.0'});

            const mock = nock(Client4.getBaseRoute()).
                get('/redirect_location').
                reply(404);

            let requestStatus = store.getState().requests.general.redirectLocation.status;
            assert.equal(requestStatus, RequestStatus.NOT_STARTED);

            // Should return the original link
            const result = await store.dispatch(Actions.getRedirectLocation('http://examp.le'));
            assert.deepEqual(result.data, {location: 'http://examp.le'});

            requestStatus = store.getState().requests.general.redirectLocation.status;
            assert.equal(requestStatus, RequestStatus.SUCCESS);

            // Should not call the API on an old server
            assert.equal(mock.isDone(), false);
        });

        it('should save the correct location', async () => {
            store.dispatch({type: GeneralTypes.RECEIVED_SERVER_VERSION, data: '5.3.0'});

            nock(Client4.getBaseRoute()).
                get('/redirect_location').
                query({url: 'http://examp.le'}).
                reply(200, '{"location": "https://example.com"}');

            // Save the found URL if it finds one
            await store.dispatch(Actions.getRedirectLocation('http://examp.le'));

            const existingURL = store.getState().entities.posts.expandedURLs['http://examp.le'];
            assert.equal(existingURL, 'https://example.com');

            // Save the found URL if it finds one
            await store.dispatch(Actions.getRedirectLocation('http://nonexisting.url'));

            const nonexistingURL = store.getState().entities.posts.expandedURLs['http://nonexisting.url'];
            assert.equal(nonexistingURL, 'http://nonexisting.url');
        });
    });
});
