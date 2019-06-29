// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {AdminTypes, UserTypes} from 'action_types';
import {Stats, Plugins} from 'constants';
import PluginState from 'constants/plugins';

function logs(state = [], action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LOGS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function audits(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_AUDITS: {
        const nextState = {...state};
        for (const audit of action.data) {
            nextState[audit.id] = audit;
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function config(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_CONFIG: {
        return action.data;
    }
    case AdminTypes.ENABLED_PLUGIN: {
        const nextPluginSettings = {...state.PluginSettings};
        const nextPluginStates = {...nextPluginSettings.PluginStates};
        nextPluginStates[action.data] = {Enable: true};
        nextPluginSettings.PluginStates = nextPluginStates;
        return {...state, PluginSettings: nextPluginSettings};
    }
    case AdminTypes.DISABLED_PLUGIN: {
        const nextPluginSettings = {...state.PluginSettings};
        const nextPluginStates = {...nextPluginSettings.PluginStates};
        nextPluginStates[action.data] = {Enable: false};
        nextPluginSettings.PluginStates = nextPluginStates;
        return {...state, PluginSettings: nextPluginSettings};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function environmentConfig(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_ENVIRONMENT_CONFIG: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function complianceReports(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_COMPLIANCE_REPORT: {
        const nextState = {...state};
        nextState[action.data.id] = action.data;
        return nextState;
    }
    case AdminTypes.RECEIVED_COMPLIANCE_REPORTS: {
        const nextState = {...state};
        for (const report of action.data) {
            nextState[report.id] = report;
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function clusterInfo(state = [], action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_CLUSTER_STATUS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return [];

    default:
        return state;
    }
}

function samlCertStatus(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_SAML_CERT_STATUS: {
        return action.data;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

export function convertAnalyticsRowsToStats(data, name) {
    const stats = {};
    const clonedData = [...data];

    if (name === 'post_counts_day') {
        clonedData.reverse();
        stats[Stats.POST_PER_DAY] = clonedData;
        return stats;
    }

    if (name === 'user_counts_with_posts_day') {
        clonedData.reverse();
        stats[Stats.USERS_WITH_POSTS_PER_DAY] = clonedData;
        return stats;
    }

    clonedData.forEach((row) => {
        let key;
        switch (row.name) {
        case 'channel_open_count':
            key = Stats.TOTAL_PUBLIC_CHANNELS;
            break;
        case 'channel_private_count':
            key = Stats.TOTAL_PRIVATE_GROUPS;
            break;
        case 'post_count':
            key = Stats.TOTAL_POSTS;
            break;
        case 'unique_user_count':
            key = Stats.TOTAL_USERS;
            break;
        case 'inactive_user_count':
            key = Stats.TOTAL_INACTIVE_USERS;
            break;
        case 'team_count':
            key = Stats.TOTAL_TEAMS;
            break;
        case 'total_websocket_connections':
            key = Stats.TOTAL_WEBSOCKET_CONNECTIONS;
            break;
        case 'total_master_db_connections':
            key = Stats.TOTAL_MASTER_DB_CONNECTIONS;
            break;
        case 'total_read_db_connections':
            key = Stats.TOTAL_READ_DB_CONNECTIONS;
            break;
        case 'daily_active_users':
            key = Stats.DAILY_ACTIVE_USERS;
            break;
        case 'monthly_active_users':
            key = Stats.MONTHLY_ACTIVE_USERS;
            break;
        case 'file_post_count':
            key = Stats.TOTAL_FILE_POSTS;
            break;
        case 'hashtag_post_count':
            key = Stats.TOTAL_HASHTAG_POSTS;
            break;
        case 'incoming_webhook_count':
            key = Stats.TOTAL_IHOOKS;
            break;
        case 'outgoing_webhook_count':
            key = Stats.TOTAL_OHOOKS;
            break;
        case 'command_count':
            key = Stats.TOTAL_COMMANDS;
            break;
        case 'session_count':
            key = Stats.TOTAL_SESSIONS;
            break;
        }

        if (key) {
            stats[key] = row.value;
        }
    });

    return stats;
}

function analytics(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_SYSTEM_ANALYTICS: {
        const stats = convertAnalyticsRowsToStats(action.data, action.name);
        return {...state, ...stats};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function teamAnalytics(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_TEAM_ANALYTICS: {
        const nextState = {...state};
        const stats = convertAnalyticsRowsToStats(action.data, action.name);
        const analyticsForTeam = {...(nextState[action.teamId] || {}), ...stats};
        nextState[action.teamId] = analyticsForTeam;
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function userAccessTokens(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_USER_ACCESS_TOKEN: {
        return {...state, [action.data.id]: action.data};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS_FOR_USER: {
        const nextState = {};

        for (const uat of action.data) {
            nextState[uat.id] = uat;
        }

        return {...state, ...nextState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS: {
        const nextState = {};

        for (const uat of action.data) {
            nextState[uat.id] = uat;
        }

        return {...state, ...nextState};
    }
    case UserTypes.REVOKED_USER_ACCESS_TOKEN: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data);
        return {...nextState};
    }
    case UserTypes.ENABLED_USER_ACCESS_TOKEN: {
        const token = {...state[action.data], is_active: true};
        return {...state, [action.data]: token};
    }
    case UserTypes.DISABLED_USER_ACCESS_TOKEN: {
        const token = {...state[action.data], is_active: false};
        return {...state, [action.data]: token};
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function userAccessTokensForUser(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_USER_ACCESS_TOKEN: {
        const nextUserState = {...(state[action.data.user_id] || {})};
        nextUserState[action.data.id] = action.data;

        return {...state, [action.data.user_id]: nextUserState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS_FOR_USER: {
        const nextUserState = {...(state[action.userId] || {})};

        for (const uat of action.data) {
            nextUserState[uat.id] = uat;
        }

        return {...state, [action.userId]: nextUserState};
    }
    case AdminTypes.RECEIVED_USER_ACCESS_TOKENS: {
        const nextUserState = {};

        for (const uat of action.data) {
            nextUserState[uat.user_id] = nextUserState[uat.user_id] || {};
            nextUserState[uat.user_id][uat.id] = uat;
        }

        return {...state, ...nextUserState};
    }
    case UserTypes.REVOKED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                Reflect.deleteProperty(nextUserState, action.data);
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.ENABLED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                const token = {...nextUserState[action.data], is_active: true};
                nextUserState[token.id] = token;
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.DISABLED_USER_ACCESS_TOKEN: {
        const userIds = Object.keys(state);
        for (let i = 0; i < userIds.length; i++) {
            const userId = userIds[i];
            if (state[userId] && state[userId][action.data]) {
                const nextUserState = {...state[userId]};
                const token = {...nextUserState[action.data], is_active: false};
                nextUserState[token.id] = token;
                return {...state, [userId]: nextUserState};
            }
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function plugins(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_PLUGINS: {
        const nextState = {...state};
        const activePlugins = action.data.active;
        for (const plugin of activePlugins) {
            nextState[plugin.id] = {...plugin, active: true};
        }

        const inactivePlugins = action.data.inactive;
        for (const plugin of inactivePlugins) {
            nextState[plugin.id] = {...plugin, active: false};
        }
        return nextState;
    }
    case AdminTypes.REMOVED_PLUGIN: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data);
        return nextState;
    }
    case AdminTypes.ENABLED_PLUGIN: {
        const nextState = {...state};
        const plugin = nextState[action.data];
        if (plugin && !plugin.active) {
            nextState[action.data] = {...plugin, active: true};
            return nextState;
        }
        return state;
    }
    case AdminTypes.DISABLED_PLUGIN: {
        const nextState = {...state};
        const plugin = nextState[action.data];
        if (plugin && plugin.active) {
            nextState[action.data] = {...plugin, active: false};
            return nextState;
        }
        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function pluginStatuses(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_PLUGIN_STATUSES: {
        const nextState = {};

        for (const plugin of (action.data || [])) {
            const id = plugin.plugin_id;

            // The plugin may be in different states across the cluster. Pick the highest one to
            // surface an error.
            const pluginState = Math.max((nextState[id] && nextState[id].state) || 0, plugin.state);

            const instances = [
                ...((nextState[id] && nextState[id].instances) || []),
                {
                    cluster_id: plugin.cluster_id,
                    version: plugin.version,
                    state: plugin.state,
                },
            ];

            nextState[id] = {
                id,
                name: (nextState[id] && nextState[id].name) || plugin.name,
                description: (nextState[id] && nextState[id].description) || plugin.description,
                version: (nextState[id] && nextState[id].version) || plugin.version,
                is_prepackaged: (nextState[id] && nextState[id].is_prepackaged) || Plugins.PREPACKAGED_PLUGINS.includes(id),
                active: pluginState > 0,
                state: pluginState,
                instances,
            };
        }

        return nextState;
    }

    case AdminTypes.ENABLE_PLUGIN_REQUEST: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        return {
            ...state,
            [pluginId]: {
                ...state[pluginId],
                state: PluginState.PLUGIN_STATE_STARTING,
            },
        };
    }

    case AdminTypes.DISABLE_PLUGIN_REQUEST: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        return {
            ...state,
            [pluginId]: {
                ...state[pluginId],
                state: PluginState.PLUGIN_STATE_STOPPING,
            },
        };
    }

    case AdminTypes.REMOVED_PLUGIN: {
        const pluginId = action.data;
        if (!state[pluginId]) {
            return state;
        }

        const nextState = {...state};
        Reflect.deleteProperty(nextState, pluginId);

        return nextState;
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function ldapGroupsCount(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LDAP_GROUPS:
        return action.data.count;
    case UserTypes.LOGOUT_SUCCESS:
        return 0;
    default:
        return state;
    }
}

function ldapGroups(state = {}, action) {
    switch (action.type) {
    case AdminTypes.RECEIVED_LDAP_GROUPS: {
        const nextState = {};
        for (const group of action.data.groups) {
            nextState[group.primary_key] = group;
        }
        return nextState;
    }
    case AdminTypes.LINKED_LDAP_GROUP: {
        const nextState = {...state};
        if (nextState[action.data.primary_key]) {
            nextState[action.data.primary_key] = action.data;
        }
        return nextState;
    }
    case AdminTypes.UNLINKED_LDAP_GROUP: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                xenia_group_id: null,
                has_syncables: null,
                failed: false,
            };
        }
        return nextState;
    }
    case AdminTypes.LINK_LDAP_GROUP_FAILURE: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                failed: true,
            };
        }
        return nextState;
    }
    case AdminTypes.UNLINK_LDAP_GROUP_FAILURE: {
        const nextState = {...state};
        if (nextState[action.data]) {
            nextState[action.data] = {
                ...nextState[action.data],
                failed: true,
            };
        }
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

export default combineReducers({

    // array of strings each representing a log entry
    logs,

    // object where every key is an audit id and has an object with audit details
    audits,

    // object representing the server configuration
    config,

    // object representing which fields of the server configuration were set through the environment config
    environmentConfig,

    // object where every key is a report id and has an object with report details
    complianceReports,

    // array of cluster status data
    clusterInfo,

    // object with certificate type as keys and boolean statuses as values
    samlCertStatus,

    // object with analytic categories as types and numbers as values
    analytics,

    // object with team ids as keys and analytics objects as values
    teamAnalytics,

    // object with user ids as keys and objects, with token ids as keys, and
    // user access tokens as values without actual token
    userAccessTokensByUser: userAccessTokensForUser,

    // object with token ids as keys, and user access tokens as values without actual token
    userAccessTokens,

    // object with plugin ids as keys and objects representing plugin manifests as values
    plugins,

    // object with plugin ids as keys and objects representing plugin statuses across the cluster
    pluginStatuses,

    // object representing the ldap groups
    ldapGroups,

    // total ldap groups
    ldapGroupsCount,
});
