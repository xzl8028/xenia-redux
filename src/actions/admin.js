// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {AdminTypes} from 'action_types';
import {General} from 'constants';

import {Client4} from 'client';

import {logError} from './errors';
import {bindClientFunc, forceLogoutIfNecessary} from './helpers';
import {batchActions} from 'redux-batched-actions';

import type {ActionFunc} from 'types/actions';
import type {Job} from 'types/jobs';
import type {GroupSearchOpts} from 'types/groups';

export function getLogs(page: number = 0, perPage: number = General.LOGS_PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getLogs,
        onRequest: AdminTypes.GET_LOGS_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_LOGS, AdminTypes.GET_LOGS_SUCCESS],
        onFailure: AdminTypes.GET_LOGS_FAILURE,
        params: [
            page,
            perPage,
        ],
    });
}

export function getAudits(page: number = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getAudits,
        onRequest: AdminTypes.GET_AUDITS_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_AUDITS, AdminTypes.GET_AUDITS_SUCCESS],
        onFailure: AdminTypes.GET_AUDITS_FAILURE,
        params: [
            page,
            perPage,
        ],
    });
}

export function getConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getConfig,
        onRequest: AdminTypes.GET_CONFIG_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_CONFIG, AdminTypes.GET_CONFIG_SUCCESS],
        onFailure: AdminTypes.GET_CONFIG_FAILURE,
    });
}

export function updateConfig(config: Object): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.updateConfig,
        onRequest: AdminTypes.UPDATE_CONFIG_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_CONFIG, AdminTypes.UPDATE_CONFIG_SUCCESS],
        onFailure: AdminTypes.UPDATE_CONFIG_FAILURE,
        params: [
            config,
        ],
    });
}

export function reloadConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.reloadConfig,
        onRequest: AdminTypes.RELOAD_CONFIG_REQUEST,
        onSuccess: AdminTypes.RELOAD_CONFIG_SUCCESS,
        onFailure: AdminTypes.RELOAD_CONFIG_FAILURE,
    });
}

export function getEnvironmentConfig(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getEnvironmentConfig,
        onRequest: AdminTypes.GET_ENVIRONMENT_CONFIG_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_ENVIRONMENT_CONFIG, AdminTypes.GET_ENVIRONMENT_CONFIG_SUCCESS],
        onFailure: AdminTypes.GET_ENVIRONMENT_CONFIG_FAILURE,
    });
}

export function testEmail(config: Object): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testEmail,
        onRequest: AdminTypes.TEST_EMAIL_REQUEST,
        onSuccess: AdminTypes.TEST_EMAIL_SUCCESS,
        onFailure: AdminTypes.TEST_EMAIL_FAILURE,
        params: [
            config,
        ],
    });
}

export function testS3Connection(config: Object): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testS3Connection,
        onRequest: AdminTypes.TEST_S3_REQUEST,
        onSuccess: AdminTypes.TEST_S3_SUCCESS,
        onFailure: AdminTypes.TEST_S3_FAILURE,
        params: [
            config,
        ],
    });
}

export function invalidateCaches(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.invalidateCaches,
        onRequest: AdminTypes.INVALIDATE_CACHES_REQUEST,
        onSuccess: AdminTypes.INVALIDATE_CACHES_SUCCESS,
        onFailure: AdminTypes.INVALIDATE_CACHES_FAILURE,
    });
}

export function recycleDatabase(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.recycleDatabase,
        onRequest: AdminTypes.RECYCLE_DATABASE_REQUEST,
        onSuccess: AdminTypes.RECYCLE_DATABASE_SUCCESS,
        onFailure: AdminTypes.RECYCLE_DATABASE_FAILURE,
    });
}

export function createComplianceReport(job: Job): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.createComplianceReport,
        onRequest: AdminTypes.CREATE_COMPLIANCE_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORT, AdminTypes.CREATE_COMPLIANCE_SUCCESS],
        onFailure: AdminTypes.CREATE_COMPLIANCE_FAILURE,
        params: [
            job,
        ],
    });
}

export function getComplianceReport(reportId: string): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getComplianceReport,
        onRequest: AdminTypes.GET_COMPLIANCE_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORT, AdminTypes.GET_COMPLIANCE_SUCCESS],
        onFailure: AdminTypes.GET_COMPLIANCE_FAILURE,
        params: [
            reportId,
        ],
    });
}

export function getComplianceReports(page: number = 0, perPage: number = General.PAGE_SIZE_DEFAULT): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getComplianceReports,
        onRequest: AdminTypes.GET_COMPLIANCE_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_COMPLIANCE_REPORTS, AdminTypes.GET_COMPLIANCE_SUCCESS],
        onFailure: AdminTypes.GET_COMPLIANCE_FAILURE,
        params: [
            page,
            perPage,
        ],
    });
}

export function uploadBrandImage(imageData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadBrandImage,
        onRequest: AdminTypes.UPLOAD_BRAND_IMAGE_REQUEST,
        onSuccess: AdminTypes.UPLOAD_BRAND_IMAGE_SUCCESS,
        onFailure: AdminTypes.UPLOAD_BRAND_IMAGE_FAILURE,
        params: [
            imageData,
        ],
    });
}

export function deleteBrandImage(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deleteBrandImage,
        onRequest: AdminTypes.DELETE_BRAND_IMAGE_REQUEST,
        onSuccess: AdminTypes.DELETE_BRAND_IMAGE_SUCCESS,
        onFailure: AdminTypes.DELETE_BRAND_IMAGE_FAILURE,
    });
}

export function getClusterStatus(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getClusterStatus,
        onRequest: AdminTypes.GET_CLUSTER_STATUS_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_CLUSTER_STATUS, AdminTypes.GET_CLUSTER_STATUS_SUCCESS],
        onFailure: AdminTypes.GET_CLUSTER_STATUS_FAILURE,
    });
}

export function testLdap(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testLdap,
        onRequest: AdminTypes.TEST_LDAP_REQUEST,
        onSuccess: AdminTypes.TEST_LDAP_SUCCESS,
        onFailure: AdminTypes.TEST_LDAP_FAILURE,
    });
}

export function syncLdap(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.syncLdap,
        onRequest: AdminTypes.SYNC_LDAP_REQUEST,
        onSuccess: AdminTypes.SYNC_LDAP_SUCCESS,
        onFailure: AdminTypes.SYNC_LDAP_FAILURE,
    });
}

export function getLdapGroups(page: number = 0, perPage: number = General.PAGE_SIZE_MAXIMUM, opts: GroupSearchOpts = {q: ''}): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getLdapGroups,
        onRequest: AdminTypes.GET_LDAP_GROUPS_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_LDAP_GROUPS, AdminTypes.GET_LDAP_GROUPS_SUCCESS],
        onFailure: AdminTypes.GET_LDAP_GROUPS_FAILURE,
        params: [
            page,
            perPage,
            opts,
        ],
    });
}

export function linkLdapGroup(key: string): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.LINK_LDAP_GROUP_REQUEST, data: key});

        let data;
        try {
            data = await Client4.linkLdapGroup(key);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.LINK_LDAP_GROUP_FAILURE, error, data: key},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.LINK_LDAP_GROUP_SUCCESS, data: null},
            {
                type: AdminTypes.LINKED_LDAP_GROUP,
                data: {
                    primary_key: key,
                    name: data.display_name,
                    xenia_group_id: data.id,
                    has_syncables: false,
                },
            },
        ]));

        return {data: true};
    };
}

export function unlinkLdapGroup(key: string): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.UNLINK_LDAP_GROUP_REQUEST, data: key});

        try {
            await Client4.unlinkLdapGroup(key);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.UNLINK_LDAP_GROUP_FAILURE, error, data: key},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.UNLINK_LDAP_GROUP_SUCCESS, data: null},
            {type: AdminTypes.UNLINKED_LDAP_GROUP, data: key},
        ]));

        return {data: true};
    };
}

export function getSamlCertificateStatus(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getSamlCertificateStatus,
        onRequest: AdminTypes.SAML_CERT_STATUS_REQUEST,
        onSuccess: [AdminTypes.RECEIVED_SAML_CERT_STATUS, AdminTypes.SAML_CERT_STATUS_SUCCESS],
        onFailure: AdminTypes.SAML_CERT_STATUS_FAILURE,
    });
}

export function uploadPublicSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPublicSamlCertificate,
        onRequest: AdminTypes.UPLOAD_SAML_PUBLIC_REQUEST,
        onSuccess: AdminTypes.UPLOAD_SAML_PUBLIC_SUCCESS,
        onFailure: AdminTypes.UPLOAD_SAML_PUBLIC_FAILURE,
        params: [
            fileData,
        ],
    });
}

export function uploadPrivateSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadPrivateSamlCertificate,
        onRequest: AdminTypes.UPLOAD_SAML_PRIVATE_REQUEST,
        onSuccess: AdminTypes.UPLOAD_SAML_PRIVATE_SUCCESS,
        onFailure: AdminTypes.UPLOAD_SAML_PRIVATE_FAILURE,
        params: [
            fileData,
        ],
    });
}

export function uploadIdpSamlCertificate(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadIdpSamlCertificate,
        onRequest: AdminTypes.UPLOAD_SAML_IDP_REQUEST,
        onSuccess: AdminTypes.UPLOAD_SAML_IDP_SUCCESS,
        onFailure: AdminTypes.UPLOAD_SAML_IDP_FAILURE,
        params: [
            fileData,
        ],
    });
}

export function removePublicSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePublicSamlCertificate,
        onRequest: AdminTypes.DELETE_SAML_PUBLIC_REQUEST,
        onSuccess: AdminTypes.DELETE_SAML_PUBLIC_SUCCESS,
        onFailure: AdminTypes.DELETE_SAML_PUBLIC_FAILURE,
    });
}

export function removePrivateSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deletePrivateSamlCertificate,
        onRequest: AdminTypes.DELETE_SAML_PRIVATE_REQUEST,
        onSuccess: AdminTypes.DELETE_SAML_PRIVATE_SUCCESS,
        onFailure: AdminTypes.DELETE_SAML_PRIVATE_FAILURE,
    });
}

export function removeIdpSamlCertificate(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.deleteIdpSamlCertificate,
        onRequest: AdminTypes.DELETE_SAML_IDP_REQUEST,
        onSuccess: AdminTypes.DELETE_SAML_IDP_SUCCESS,
        onFailure: AdminTypes.DELETE_SAML_IDP_FAILURE,
    });
}

export function testElasticsearch(config: Object): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.testElasticsearch,
        onRequest: AdminTypes.TEST_ELASTICSEARCH_REQUEST,
        onSuccess: AdminTypes.TEST_ELASTICSEARCH_SUCCESS,
        onFailure: AdminTypes.TEST_ELASTICSEARCH_FAILURE,
        params: [
            config,
        ],
    });
}

export function purgeElasticsearchIndexes(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.purgeElasticsearchIndexes,
        onRequest: AdminTypes.PURGE_ELASTICSEARCH_INDEXES_REQUEST,
        onSuccess: AdminTypes.PURGE_ELASTICSEARCH_INDEXES_SUCCESS,
        onFailure: AdminTypes.PURGE_ELASTICSEARCH_INDEXES_FAILURE,
    });
}

export function uploadLicense(fileData: File): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.uploadLicense,
        onRequest: AdminTypes.UPLOAD_LICENSE_REQUEST,
        onSuccess: AdminTypes.UPLOAD_LICENSE_SUCCESS,
        onFailure: AdminTypes.UPLOAD_LICENSE_FAILURE,
        params: [
            fileData,
        ],
    });
}

export function removeLicense(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.removeLicense,
        onRequest: AdminTypes.REMOVE_LICENSE_REQUEST,
        onSuccess: AdminTypes.REMOVE_LICENSE_SUCCESS,
        onFailure: AdminTypes.REMOVE_LICENSE_FAILURE,
    });
}

export function getAnalytics(name: string, teamId: string = ''): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.GET_ANALYTICS_REQUEST, data: null}, getState);

        let data;
        try {
            data = await Client4.getAnalytics(name, teamId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.GET_ANALYTICS_FAILURE, error},
                logError(error),
            ]), getState);
            return {error};
        }

        const actions = [{type: AdminTypes.GET_ANALYTICS_SUCCESS, data: null}];
        if (teamId === '') {
            actions.push({type: AdminTypes.RECEIVED_SYSTEM_ANALYTICS, data, name});
        } else {
            actions.push({type: AdminTypes.RECEIVED_TEAM_ANALYTICS, data, name, teamId});
        }

        dispatch(batchActions(actions), getState);

        return {data};
    };
}

export function getStandardAnalytics(teamId: string = ''): ActionFunc {
    return getAnalytics('standard', teamId);
}

export function getAdvancedAnalytics(teamId: string = ''): ActionFunc {
    return getAnalytics('extra_counts', teamId);
}

export function getPostsPerDayAnalytics(teamId: string = ''): ActionFunc {
    return getAnalytics('post_counts_day', teamId);
}

export function getUsersPerDayAnalytics(teamId: string = ''): ActionFunc {
    return getAnalytics('user_counts_with_posts_day', teamId);
}

export function uploadPlugin(fileData: File, force: boolean = false): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.UPLOAD_PLUGIN_REQUEST, data: null});

        let data;
        try {
            data = await Client4.uploadPlugin(fileData, force);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.UPLOAD_PLUGIN_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.UPLOAD_PLUGIN_SUCCESS, data: null},
        ]));

        return {data};
    };
}

export function getPlugins(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getPlugins,
        onRequest: AdminTypes.GET_PLUGIN_REQUEST,
        onSuccess: [AdminTypes.GET_PLUGIN_SUCCESS, AdminTypes.RECEIVED_PLUGINS],
        onFailure: AdminTypes.GET_PLUGIN_FAILURE,
    });
}

export function getPluginStatuses(): ActionFunc {
    return bindClientFunc({
        clientFunc: Client4.getPluginStatuses,
        onRequest: AdminTypes.GET_PLUGIN_STATUSES_REQUEST,
        onSuccess: [AdminTypes.GET_PLUGIN_STATUSES_SUCCESS, AdminTypes.RECEIVED_PLUGIN_STATUSES],
        onFailure: AdminTypes.GET_PLUGIN_STATUSES_FAILURE,
    });
}

export function removePlugin(pluginId: string): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.REMOVE_PLUGIN_REQUEST, data: pluginId});

        try {
            await Client4.removePlugin(pluginId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.REMOVE_PLUGIN_FAILURE, error, data: pluginId},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.REMOVE_PLUGIN_SUCCESS, data: null},
            {type: AdminTypes.REMOVED_PLUGIN, data: pluginId},
        ]));

        return {data: true};
    };
}
export function enablePlugin(pluginId: string): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.ENABLE_PLUGIN_REQUEST, data: pluginId});

        try {
            await Client4.enablePlugin(pluginId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.ENABLE_PLUGIN_FAILURE, error, data: pluginId},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.ENABLE_PLUGIN_SUCCESS, data: null},
            {type: AdminTypes.ENABLED_PLUGIN, data: pluginId},
        ]));

        return {data: true};
    };
}

export function disablePlugin(pluginId: string): ActionFunc {
    return async (dispatch, getState) => {
        dispatch({type: AdminTypes.DISABLE_PLUGIN_REQUEST, data: pluginId});

        try {
            await Client4.disablePlugin(pluginId);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: AdminTypes.DISABLE_PLUGIN_FAILURE, error, data: pluginId},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {type: AdminTypes.DISABLE_PLUGIN_SUCCESS, data: null},
            {type: AdminTypes.DISABLED_PLUGIN, data: pluginId},
        ]));

        return {data: true};
    };
}
