// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import fs from 'fs';
import assert from 'assert';
import nock from 'nock';

import * as Actions from 'actions/admin';
import {Client4} from 'client';

import {RequestStatus, Stats} from 'constants';
import TestHelper from 'test/test_helper';
import configureStore from 'test/test_store';

const OK_RESPONSE = {status: 'OK'};
const NO_GROUPS_RESPONSE = {count: 0, groups: []};

describe('Actions.Admin', () => {
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

    it('getLogs', async () => {
        nock(Client4.getBaseRoute()).
            get('/logs').
            query(true).
            reply(200, [
                '[2017/04/04 14:56:19 EDT] [INFO] Starting Server...',
                '[2017/04/04 14:56:19 EDT] [INFO] Server is listening on :8065',
                '[2017/04/04 15:01:48 EDT] [INFO] Stopping Server...',
                '[2017/04/04 15:01:48 EDT] [INFO] Closing SqlStore',
            ]);

        await Actions.getLogs()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getLogs;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLogs request failed');
        }

        const logs = state.entities.admin.logs;
        assert.ok(logs);
        assert.ok(logs.length > 0);
    });

    it('getAudits', async () => {
        nock(Client4.getBaseRoute()).
            get('/audits').
            query(true).
            reply(200, [
                {
                    id: 'z6ghakhm5brsub66cjhz9yb9za',
                    create_at: 1491331476323,
                    user_id: 'ua7yqgjiq3dabc46ianp3yfgty',
                    action: '/api/v4/teams/o5pjxhkq8br8fj6xnidt7hm3ja',
                    extra_info: '',
                    ip_address: '127.0.0.1',
                    session_id: 'u3yb6bqe6fg15bu4stzyto8rgh',
                },
            ]);

        await Actions.getAudits()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getAudits;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getAudits request failed');
        }

        const audits = state.entities.admin.audits;
        assert.ok(audits);
        assert.ok(Object.keys(audits).length > 0);
    });

    it('getConfig', async () => {
        nock(Client4.getBaseRoute()).
            get('/config').
            reply(200, {
                TeamSettings: {
                    SiteName: 'Xenia',
                },
            });

        nock(Client4.getBaseRoute()).
            get('/terms_of_service').
            reply(200, {
                create_at: 1537976679426,
                id: '1234',
                text: 'Terms of Service',
                user_id: '1',
            });

        await Actions.getConfig()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getConfig;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getConfig request failed');
        }

        const config = state.entities.admin.config;
        assert.ok(config);
        assert.ok(config.TeamSettings);
        assert.ok(config.TeamSettings.SiteName === 'Xenia');
    });

    it('updateConfig', async () => {
        nock(Client4.getBaseRoute()).
            get('/config').
            reply(200, {
                TeamSettings: {
                    SiteName: 'Xenia',
                },
            });

        nock(Client4.getBaseRoute()).
            post('/terms_of_service').
            reply(201, {
                create_at: 1537976679426,
                id: '1234',
                text: 'Terms of Service',
                user_id: '1',
            });

        const {data} = await Actions.getConfig()(store.dispatch, store.getState);
        const updated = JSON.parse(JSON.stringify(data));
        const oldSiteName = updated.TeamSettings.SiteName;
        const testSiteName = 'XeniaReduxTest';
        updated.TeamSettings.SiteName = testSiteName;

        nock(Client4.getBaseRoute()).
            put('/config').
            reply(200, updated);

        await Actions.updateConfig(updated)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.updateConfig;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('updateConfig request failed');
        }

        const config = state.entities.admin.config;
        assert.ok(config);
        assert.ok(config.TeamSettings);
        assert.ok(config.TeamSettings.SiteName === testSiteName);

        updated.TeamSettings.SiteName = oldSiteName;

        nock(Client4.getBaseRoute()).
            put('/config').
            reply(200, updated);

        await Actions.updateConfig(updated)(store.dispatch, store.getState);
    });

    it('reloadConfig', async () => {
        nock(Client4.getBaseRoute()).
            post('/config/reload').
            reply(200, OK_RESPONSE);

        await Actions.reloadConfig()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.reloadConfig;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('reloadConfig request failed');
        }
    });

    it('getEnvironmentConfig', async () => {
        nock(Client4.getBaseRoute()).
            get('/config/environment').
            reply(200, {
                ServiceSettings: {
                    SiteURL: true,
                },
                TeamSettings: {
                    SiteName: true,
                },
            });

        await store.dispatch(Actions.getEnvironmentConfig());

        const state = store.getState();
        const request = state.requests.admin.getEnvironmentConfig;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getEnvironmentConfig request failed');
        }

        const config = state.entities.admin.environmentConfig;
        assert.ok(config);
        assert.ok(config.ServiceSettings);
        assert.ok(config.ServiceSettings.SiteURL);
        assert.ok(config.TeamSettings);
        assert.ok(config.TeamSettings.SiteName);
    });

    it('testEmail', async () => {
        nock(Client4.getBaseRoute()).
            get('/config').
            reply(200, {});

        const {data: config} = await Actions.getConfig()(store.dispatch, store.getState);

        nock(Client4.getBaseRoute()).
            post('/email/test').
            reply(200, OK_RESPONSE);

        await Actions.testEmail(config)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.testEmail;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('testEmail request failed');
        }
    });

    it('testS3Connection', async () => {
        nock(Client4.getBaseRoute()).
            get('/config').
            reply(200, {});

        const {data: config} = await Actions.getConfig()(store.dispatch, store.getState);

        nock(Client4.getBaseRoute()).
            post('/file/s3_test').
            reply(200, OK_RESPONSE);

        await Actions.testS3Connection(config)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.testS3Connection;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('testS3Connection request failed');
        }
    });

    it('invalidateCaches', async () => {
        nock(Client4.getBaseRoute()).
            post('/caches/invalidate').
            reply(200, OK_RESPONSE);

        await Actions.invalidateCaches()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.invalidateCaches;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('invalidateCaches request failed');
        }
    });

    it('recycleDatabase', async () => {
        nock(Client4.getBaseRoute()).
            post('/database/recycle').
            reply(200, OK_RESPONSE);

        await Actions.recycleDatabase()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.recycleDatabase;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('recycleDatabase request failed');
        }
    });

    it('createComplianceReport', async () => {
        const job = {
            desc: 'testjob',
            emails: 'joram@example.com',
            keywords: 'testkeyword',
            start_at: 1457654400000,
            end_at: 1458000000000,
        };

        nock(Client4.getBaseRoute()).
            post('/compliance/reports').
            reply(201, {
                id: 'six4h67ja7ntdkek6g13dp3wka',
                create_at: 1491399241953,
                user_id: 'ua7yqgjiq3dabc46ianp3yfgty',
                status: 'running',
                count: 0,
                desc: 'testjob',
                type: 'adhoc',
                start_at: 1457654400000,
                end_at: 1458000000000,
                keywords: 'testkeyword',
                emails: 'joram@example.com',
            });

        const {data: created} = await Actions.createComplianceReport(job)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.createCompliance;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('createComplianceReport request failed');
        }

        const reports = state.entities.admin.complianceReports;
        assert.ok(reports);
        assert.ok(reports[created.id]);
    });

    it('getComplianceReport', async () => {
        const job = {
            desc: 'testjob',
            emails: 'joram@example.com',
            keywords: 'testkeyword',
            start_at: 1457654400000,
            end_at: 1458000000000,
        };

        nock(Client4.getBaseRoute()).
            post('/compliance/reports').
            reply(201, {
                id: 'six4h67ja7ntdkek6g13dp3wka',
                create_at: 1491399241953,
                user_id: 'ua7yqgjiq3dabc46ianp3yfgty',
                status: 'running',
                count: 0,
                desc: 'testjob',
                type: 'adhoc',
                start_at: 1457654400000,
                end_at: 1458000000000,
                keywords: 'testkeyword',
                emails: 'joram@example.com',
            });

        const {data: report} = await Actions.createComplianceReport(job)(store.dispatch, store.getState);

        nock(Client4.getBaseRoute()).
            get(`/compliance/reports/${report.id}`).
            reply(200, report);

        await Actions.getComplianceReport(report.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getCompliance;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getComplianceReport request failed err=' + request.error);
        }

        const reports = state.entities.admin.complianceReports;
        assert.ok(reports);
        assert.ok(reports[report.id]);
    });

    it('getComplianceReports', async () => {
        const job = {
            desc: 'testjob',
            emails: 'joram@example.com',
            keywords: 'testkeyword',
            start_at: 1457654400000,
            end_at: 1458000000000,
        };

        nock(Client4.getBaseRoute()).
            post('/compliance/reports').
            reply(201, {
                id: 'six4h67ja7ntdkek6g13dp3wka',
                create_at: 1491399241953,
                user_id: 'ua7yqgjiq3dabc46ianp3yfgty',
                status: 'running',
                count: 0,
                desc: 'testjob',
                type: 'adhoc',
                start_at: 1457654400000,
                end_at: 1458000000000,
                keywords: 'testkeyword',
                emails: 'joram@example.com',
            });

        const {data: report} = await Actions.createComplianceReport(job)(store.dispatch, store.getState);

        nock(Client4.getBaseRoute()).
            get('/compliance/reports').
            query(true).
            reply(200, [report]);

        await Actions.getComplianceReports()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getCompliance;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getComplianceReports request failed err=' + request.error);
        }

        const reports = state.entities.admin.complianceReports;
        assert.ok(reports);
        assert.ok(reports[report.id]);
    });

    it('uploadBrandImage', async () => {
        const testImageData = fs.createReadStream('test/assets/images/test.png');

        nock(Client4.getBaseRoute()).
            post('/brand/image').
            reply(200, OK_RESPONSE);

        await Actions.uploadBrandImage(testImageData)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadBrandImage;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadBrandImage request failed');
        }
    });

    it('deleteBrandImage', async () => {
        nock(Client4.getBaseRoute()).
            delete('/brand/image').
            reply(200, OK_RESPONSE);

        await Actions.deleteBrandImage()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.deleteBrandImage;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('deleteBrandImage request failed');
        }
    });

    it('getClusterStatus', async () => {
        nock(Client4.getBaseRoute()).
            get('/cluster/status').
            reply(200, [
                {
                    id: 'someid',
                    version: 'someversion',
                },
            ]);

        await Actions.getClusterStatus()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getClusterStatus;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getClusterStatus request failed');
        }

        const clusterInfo = state.entities.admin.clusterInfo;
        assert.ok(clusterInfo);
        assert.ok(clusterInfo.length === 1);
        assert.ok(clusterInfo[0].id === 'someid');
    });

    it('testLdap', async () => {
        nock(Client4.getBaseRoute()).
            post('/ldap/test').
            reply(200, OK_RESPONSE);

        await Actions.testLdap()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.testLdap;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('testLdap request failed err=' + request.error);
        }
    });

    it('syncLdap', async () => {
        nock(Client4.getBaseRoute()).
            post('/ldap/sync').
            reply(200, OK_RESPONSE);

        await Actions.syncLdap()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.syncLdap;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('syncLdap request failed err=' + request.error);
        }
    });

    it('getSamlCertificateStatus', async () => {
        nock(Client4.getBaseRoute()).
            get('/saml/certificate/status').
            reply(200, {
                public_certificate_file: true,
                private_key_file: true,
                idp_certificate_file: true,
            });

        await Actions.getSamlCertificateStatus()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getSamlCertificateStatus;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getSamlCertificateStatus request failed err=' + request.error);
        }

        const certStatus = state.entities.admin.samlCertStatus;
        assert.ok(certStatus);
        assert.ok(certStatus.idp_certificate_file);
        assert.ok(certStatus.private_key_file);
        assert.ok(certStatus.public_certificate_file);
    });

    it('uploadPublicSamlCertificate', async () => {
        const testFileData = fs.createReadStream('test/assets/images/test.png');

        nock(Client4.getBaseRoute()).
            post('/saml/certificate/public').
            reply(200, OK_RESPONSE);

        await Actions.uploadPublicSamlCertificate(testFileData)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadPublicSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadPublicSamlCertificate request failed err=' + request.error);
        }
    });

    it('uploadPrivateSamlCertificate', async () => {
        const testFileData = fs.createReadStream('test/assets/images/test.png');

        nock(Client4.getBaseRoute()).
            post('/saml/certificate/private').
            reply(200, OK_RESPONSE);

        await Actions.uploadPrivateSamlCertificate(testFileData)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadPrivateSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadPrivateSamlCertificate request failed err=' + request.error);
        }
    });

    it('uploadIdpSamlCertificate', async () => {
        const testFileData = fs.createReadStream('test/assets/images/test.png');

        nock(Client4.getBaseRoute()).
            post('/saml/certificate/idp').
            reply(200, OK_RESPONSE);

        await Actions.uploadIdpSamlCertificate(testFileData)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadIdpSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadIdpSamlCertificate request failed err=' + request.error);
        }
    });

    it('removePublicSamlCertificate', async () => {
        nock(Client4.getBaseRoute()).
            delete('/saml/certificate/public').
            reply(200, OK_RESPONSE);

        await Actions.removePublicSamlCertificate()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.removePublicSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('removePublicSamlCertificate request failed err=' + request.error);
        }
    });

    it('removePrivateSamlCertificate', async () => {
        nock(Client4.getBaseRoute()).
            delete('/saml/certificate/private').
            reply(200, OK_RESPONSE);

        await Actions.removePrivateSamlCertificate()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.removePrivateSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('removePrivateSamlCertificate request failed err=' + request.error);
        }
    });

    it('removeIdpSamlCertificate', async () => {
        nock(Client4.getBaseRoute()).
            delete('/saml/certificate/idp').
            reply(200, OK_RESPONSE);

        await Actions.removeIdpSamlCertificate()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.removeIdpSamlCertificate;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('removeIdpSamlCertificate request failed err=' + request.error);
        }
    });

    it('testElasticsearch', async () => {
        nock(Client4.getBaseRoute()).
            post('/elasticsearch/test').
            reply(200, OK_RESPONSE);

        await Actions.testElasticsearch({})(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.testElasticsearch;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('testElasticsearch request failed err=' + request.error);
        }
    });

    it('purgeElasticsearchIndexes', async () => {
        nock(Client4.getBaseRoute()).
            post('/elasticsearch/purge_indexes').
            reply(200, OK_RESPONSE);

        await Actions.purgeElasticsearchIndexes()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.purgeElasticsearchIndexes;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('purgeElasticsearchIndexes request failed err=' + request.error);
        }
    });

    it('uploadLicense', async () => {
        const testFileData = fs.createReadStream('test/assets/images/test.png');

        nock(Client4.getBaseRoute()).
            post('/license').
            reply(200, OK_RESPONSE);

        await Actions.uploadLicense(testFileData)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadLicense;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadLicense request failed err=' + request.error);
        }
    });

    it('removeLicense', async () => {
        nock(Client4.getBaseRoute()).
            delete('/license').
            reply(200, OK_RESPONSE);

        await Actions.removeLicense()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.removeLicense;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('removeLicense request failed err=' + request.error);
        }
    });

    it('getStandardAnalytics', async () => {
        nock(Client4.getBaseRoute()).
            get('/analytics/old').
            query(true).
            times(2).
            reply(200, [{name: 'channel_open_count', value: 495}, {name: 'channel_private_count', value: 19}, {name: 'post_count', value: 2763}, {name: 'unique_user_count', value: 316}, {name: 'team_count', value: 159}, {name: 'total_websocket_connections', value: 1}, {name: 'total_master_db_connections', value: 8}, {name: 'total_read_db_connections', value: 0}, {name: 'daily_active_users', value: 22}, {name: 'monthly_active_users', value: 114}]);

        await Actions.getStandardAnalytics()(store.dispatch, store.getState);
        await Actions.getStandardAnalytics(TestHelper.basicTeam.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getAnalytics;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getAnalytics request failed');
        }

        const analytics = state.entities.admin.analytics;
        assert.ok(analytics);
        assert.ok(analytics[Stats.TOTAL_PUBLIC_CHANNELS] > 0);

        const teamAnalytics = state.entities.admin.teamAnalytics;
        assert.ok(teamAnalytics);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id]);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id][Stats.TOTAL_PUBLIC_CHANNELS] > 0);
    });

    it('getAdvancedAnalytics', async () => {
        nock(Client4.getBaseRoute()).
            get('/analytics/old').
            query(true).
            times(2).
            reply(200, [{name: 'file_post_count', value: 24}, {name: 'hashtag_post_count', value: 876}, {name: 'incoming_webhook_count', value: 16}, {name: 'outgoing_webhook_count', value: 18}, {name: 'command_count', value: 14}, {name: 'session_count', value: 149}]);

        await Actions.getAdvancedAnalytics()(store.dispatch, store.getState);
        await Actions.getAdvancedAnalytics(TestHelper.basicTeam.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getAnalytics;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getAnalytics request failed');
        }

        const analytics = state.entities.admin.analytics;
        assert.ok(analytics);
        assert.ok(analytics[Stats.TOTAL_SESSIONS] > 0);

        const teamAnalytics = state.entities.admin.teamAnalytics;
        assert.ok(teamAnalytics);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id]);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id][Stats.TOTAL_SESSIONS] > 0);
    });

    it('getPostsPerDayAnalytics', async () => {
        nock(Client4.getBaseRoute()).
            get('/analytics/old').
            query(true).
            times(2).
            reply(200, [{name: '2017-06-18', value: 16}, {name: '2017-06-16', value: 209}, {name: '2017-06-12', value: 35}, {name: '2017-06-08', value: 227}, {name: '2017-06-07', value: 27}, {name: '2017-06-06', value: 136}, {name: '2017-06-05', value: 127}, {name: '2017-06-04', value: 39}, {name: '2017-06-02', value: 3}, {name: '2017-05-31', value: 52}, {name: '2017-05-30', value: 52}, {name: '2017-05-29', value: 9}, {name: '2017-05-26', value: 198}, {name: '2017-05-25', value: 144}, {name: '2017-05-24', value: 1130}, {name: '2017-05-23', value: 146}]);

        await Actions.getPostsPerDayAnalytics()(store.dispatch, store.getState);
        await Actions.getPostsPerDayAnalytics(TestHelper.basicTeam.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getAnalytics;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getAnalytics request failed');
        }

        const analytics = state.entities.admin.analytics;
        assert.ok(analytics);
        assert.ok(analytics[Stats.POST_PER_DAY]);

        const teamAnalytics = state.entities.admin.teamAnalytics;
        assert.ok(teamAnalytics);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id]);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id][Stats.POST_PER_DAY]);
    });

    it('getUsersPerDayAnalytics', async () => {
        nock(Client4.getBaseRoute()).
            get('/analytics/old').
            query(true).
            times(2).
            reply(200, [{name: '2017-06-18', value: 2}, {name: '2017-06-16', value: 47}, {name: '2017-06-12', value: 4}, {name: '2017-06-08', value: 55}, {name: '2017-06-07', value: 2}, {name: '2017-06-06', value: 1}, {name: '2017-06-05', value: 2}, {name: '2017-06-04', value: 13}, {name: '2017-06-02', value: 1}, {name: '2017-05-31', value: 3}, {name: '2017-05-30', value: 4}, {name: '2017-05-29', value: 3}, {name: '2017-05-26', value: 40}, {name: '2017-05-25', value: 26}, {name: '2017-05-24', value: 43}, {name: '2017-05-23', value: 3}]);

        await Actions.getUsersPerDayAnalytics()(store.dispatch, store.getState);
        await Actions.getUsersPerDayAnalytics(TestHelper.basicTeam.id)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getAnalytics;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getAnalytics request failed');
        }

        const analytics = state.entities.admin.analytics;
        assert.ok(analytics);
        assert.ok(analytics[Stats.USERS_WITH_POSTS_PER_DAY]);

        const teamAnalytics = state.entities.admin.teamAnalytics;
        assert.ok(teamAnalytics);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id]);
        assert.ok(teamAnalytics[TestHelper.basicTeam.id][Stats.USERS_WITH_POSTS_PER_DAY]);
    });

    it('overwritePlugin', async () => {
        const data1 = fs.createReadStream('test/setup.js');
        const data2 = fs.createReadStream('test/setup.js');
        const testPlugin = {id: 'testplugin', webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            post('/plugins', (body) => {
                return !body.match(/Content-Disposition: form-data; name="force"\r\n\r\ntrue\r\n/);
            }).
            reply(200, testPlugin);
        await Actions.uploadPlugin(data1, false)(store.dispatch, store.getState);

        nock(Client4.getBaseRoute()).
            post('/plugins', (body) => {
                return body.match(/Content-Disposition: form-data; name="force"\r\n\r\ntrue\r\n/);
            }).
            reply(200, testPlugin);
        await Actions.uploadPlugin(data2, true)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadPlugin;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadPlugin request failed err=' + request.error);
        }
    });

    it('uploadPlugin', async () => {
        const testFileData = fs.createReadStream('test/assets/images/test.png');
        const testPlugin = {id: 'testplugin', webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            post('/plugins').
            reply(200, testPlugin);
        await Actions.uploadPlugin(testFileData, false)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.uploadPlugin;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('uploadPlugin request failed err=' + request.error);
        }
    });

    it('getPlugins', async () => {
        const testPlugin = {id: 'testplugin', webapp: {bundle_path: '/static/somebundle.js'}};
        const testPlugin2 = {id: 'testplugin2', webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            get('/plugins').
            reply(200, {active: [testPlugin], inactive: [testPlugin2]});

        await Actions.getPlugins()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getPlugins;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getPlugins request failed err=' + request.error);
        }

        const plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);
        assert.ok(plugins[testPlugin.id].active);
        assert.ok(plugins[testPlugin2.id]);
        assert.ok(!plugins[testPlugin2.id].active);
    });

    it('getPluginStatuses', async () => {
        const testPluginStatus = {
            plugin_id: 'testplugin',
            state: 1,
        };
        const testPluginStatus2 = {
            plugin_id: 'testplugin2',
            state: 0,
        };

        nock(Client4.getBaseRoute()).
            get('/plugins/statuses').
            reply(200, [testPluginStatus, testPluginStatus2]);

        await Actions.getPluginStatuses()(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getPluginStatuses;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getPluginStatuses request failed err=' + request.error);
        }

        const pluginStatuses = state.entities.admin.pluginStatuses;
        assert.ok(pluginStatuses);
        assert.ok(pluginStatuses[testPluginStatus.plugin_id]);
        assert.ok(pluginStatuses[testPluginStatus.plugin_id].active);
        assert.ok(pluginStatuses[testPluginStatus2.plugin_id]);
        assert.ok(!pluginStatuses[testPluginStatus2.plugin_id].active);
    });

    it('removePlugin', async () => {
        const testPlugin = {id: 'testplugin3', webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            get('/plugins').
            reply(200, {active: [], inactive: [testPlugin]});

        await Actions.getPlugins()(store.dispatch, store.getState);

        let state = store.getState();
        let plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);

        nock(Client4.getBaseRoute()).
            delete(`/plugins/${testPlugin.id}`).
            reply(200, OK_RESPONSE);

        await Actions.removePlugin(testPlugin.id)(store.dispatch, store.getState);

        const request = state.requests.admin.removePlugin;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('removePlugin request failed err=' + request.error);
        }

        state = store.getState();
        plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(!plugins[testPlugin.id]);
    });

    it('enablePlugin', async () => {
        const testPlugin = {id: TestHelper.generateId(), webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            get('/plugins').
            reply(200, {active: [], inactive: [testPlugin]});

        await Actions.getPlugins()(store.dispatch, store.getState);

        let state = store.getState();
        let plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);
        assert.ok(!plugins[testPlugin.id].active);

        nock(Client4.getBaseRoute()).
            post(`/plugins/${testPlugin.id}/enable`).
            reply(200, OK_RESPONSE);

        await Actions.enablePlugin(testPlugin.id)(store.dispatch, store.getState);

        const request = state.requests.admin.enablePlugin;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error(request.error);
        }

        state = store.getState();
        plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);
        assert.ok(plugins[testPlugin.id].active);
    });

    it('disablePlugin', async () => {
        const testPlugin = {id: TestHelper.generateId(), webapp: {bundle_path: '/static/somebundle.js'}};

        nock(Client4.getBaseRoute()).
            get('/plugins').
            reply(200, {active: [testPlugin], inactive: []});

        await Actions.getPlugins()(store.dispatch, store.getState);

        let state = store.getState();
        let plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);
        assert.ok(plugins[testPlugin.id].active);

        nock(Client4.getBaseRoute()).
            post(`/plugins/${testPlugin.id}/disable`).
            reply(200, OK_RESPONSE);

        await Actions.disablePlugin(testPlugin.id)(store.dispatch, store.getState);

        const request = state.requests.admin.disablePlugin;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error(request.error);
        }

        state = store.getState();
        plugins = state.entities.admin.plugins;
        assert.ok(plugins);
        assert.ok(plugins[testPlugin.id]);
        assert.ok(!plugins[testPlugin.id].active);
    });

    it('getLdapGroups', async () => {
        const ldapGroups = {
            count: 2,
            groups: [
                {primary_key: 'test1', name: 'test1', xenia_group_id: null, has_syncables: false},
                {primary_key: 'test2', name: 'test2', xenia_group_id: 'xenia-id', has_syncables: true},
            ],
        };

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100').
            reply(200, ldapGroups);

        await Actions.getLdapGroups(0, 100, null)(store.dispatch, store.getState);

        const state = store.getState();
        const request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }

        const groups = state.entities.admin.ldapGroups;
        assert.ok(groups);
        assert.ok(groups[ldapGroups.groups[0].primary_key]);
        assert.ok(groups[ldapGroups.groups[1].primary_key]);
    });

    it('getLdapGroups is_linked', async () => {
        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=&is_linked=true').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: '', is_linked: true})(store.dispatch, store.getState);

        let state = store.getState();
        let request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=&is_linked=false').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: '', is_linked: false})(store.dispatch, store.getState);

        state = store.getState();
        request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }
    });

    it('getLdapGroups is_configured', async () => {
        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=&is_configured=true').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: '', is_configured: true})(store.dispatch, store.getState);

        let state = store.getState();
        let request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=&is_configured=false').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: '', is_configured: false})(store.dispatch, store.getState);

        state = store.getState();
        request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }
    });

    it('getLdapGroups with name query', async () => {
        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=est').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: 'est'})(store.dispatch, store.getState);

        let state = store.getState();
        let request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100&q=esta').
            reply(200, NO_GROUPS_RESPONSE);

        await Actions.getLdapGroups(0, 100, {q: 'esta'})(store.dispatch, store.getState);

        state = store.getState();
        request = state.requests.admin.getLdapGroups;
        if (request.status === RequestStatus.FAILURE) {
            throw new Error('getLdapGroups request failed err=' + request.error);
        }
    });

    it('linkLdapGroup', async () => {
        const ldapGroups = {
            count: 2,
            groups: [
                {primary_key: 'test1', name: 'test1', xenia_group_id: null, has_syncables: false},
                {primary_key: 'test2', name: 'test2', xenia_group_id: 'xenia-id', has_syncables: true},
            ],
        };

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100').
            reply(200, ldapGroups);

        await Actions.getLdapGroups(0, 100, null)(store.dispatch, store.getState);

        const key = 'test1';

        nock(Client4.getBaseRoute()).
            post(`/ldap/groups/${key}/link`).
            reply(200, {display_name: 'test1', id: 'new-xenia-id'});

        await Actions.linkLdapGroup(key)(store.dispatch, store.getState);

        const state = store.getState();
        const groups = state.entities.admin.ldapGroups;
        assert.ok(groups[key]);
        assert.ok(groups[key].xenia_group_id === 'new-xenia-id');
        assert.ok(groups[key].has_syncables === false);
    });

    it('unlinkLdapGroup', async () => {
        const ldapGroups = {
            count: 2,
            groups: [
                {primary_key: 'test1', name: 'test1', xenia_group_id: null, has_syncables: false},
                {primary_key: 'test2', name: 'test2', xenia_group_id: 'xenia-id', has_syncables: true},
            ],
        };

        nock(Client4.getBaseRoute()).
            get('/ldap/groups?page=0&per_page=100').
            reply(200, ldapGroups);

        await Actions.getLdapGroups(0, 100, null)(store.dispatch, store.getState);

        const key = 'test2';

        nock(Client4.getBaseRoute()).
            delete(`/ldap/groups/${key}/link`).
            reply(200, {ok: true});

        await Actions.unlinkLdapGroup(key)(store.dispatch, store.getState);

        const state = store.getState();
        const groups = state.entities.admin.ldapGroups;
        assert.ok(groups[key]);
        assert.ok(groups[key].xenia_group_id === null);
        assert.ok(groups[key].has_syncables === null);
    });
});
