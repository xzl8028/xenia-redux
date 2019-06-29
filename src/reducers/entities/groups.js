// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {GroupTypes} from 'action_types';

function syncables(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP_TEAMS: {
        return {
            ...state,
            [action.group_id]: {
                ...state[action.group_id],
                teams: action.data,
            },
        };
    }
    case GroupTypes.RECEIVED_GROUP_CHANNELS: {
        return {
            ...state,
            [action.group_id]: {
                ...state[action.group_id],
                channels: action.data,
            },
        };
    }
    case GroupTypes.LINKED_GROUP_TEAM: {
        let nextGroupTeams = [];

        if (!state[action.data.group_id] || !state[action.data.group_id].teams) {
            nextGroupTeams = [action.data];
        } else {
            nextGroupTeams = {...state}[action.data.group_id].teams;
            for (let i = 0, len = nextGroupTeams.length; i < len; i++) {
                if (nextGroupTeams[i].team_id === action.data.team_id) {
                    nextGroupTeams[i] = action.data;
                }
            }
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                teams: nextGroupTeams,
            },
        };
    }
    case GroupTypes.LINKED_GROUP_CHANNEL: {
        let nextGroupChannels = [];

        if (!state[action.data.group_id] || !state[action.data.group_id].channels) {
            nextGroupChannels = [action.data];
        } else {
            nextGroupChannels = {...state}[action.data.group_id].channels;
            for (let i = 0, len = nextGroupChannels.length; i < len; i++) {
                if (nextGroupChannels[i].channel_id === action.data.channel_id) {
                    nextGroupChannels[i] = action.data;
                }
            }
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                channels: nextGroupChannels,
            },
        };
    }
    case GroupTypes.UNLINKED_GROUP_TEAM: {
        if (!state[action.data.group_id]) {
            return state;
        }
        const nextTeams = state[action.data.group_id].teams.slice();

        const index = nextTeams.findIndex((groupTeam) => {
            return groupTeam.team_id === action.data.syncable_id;
        });

        if (index !== -1) {
            nextTeams.splice(index, 1);
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                teams: nextTeams,
            },
        };
    }
    case GroupTypes.UNLINKED_GROUP_CHANNEL: {
        if (!state[action.data.group_id]) {
            return state;
        }
        const nextChannels = state[action.data.group_id].channels.slice();

        const index = nextChannels.findIndex((groupChannel) => {
            return groupChannel.channel_id === action.data.syncable_id;
        });

        if (index !== -1) {
            nextChannels.splice(index, 1);
        }

        return {
            ...state,
            [action.data.group_id]: {
                ...state[action.data.group_id],
                channels: nextChannels,
            },
        };
    }
    default:
        return state;
    }
}

function members(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP_MEMBERS: {
        return {
            ...state,
            [action.group_id]: {
                members: action.data.members,
                totalMemberCount: action.data.total_member_count,
            },
        };
    }
    default:
        return state;
    }
}

function groups(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUP: {
        return {
            ...state,
            [action.data.id]: action.data,
        };
    }
    case GroupTypes.RECEIVED_GROUPS: {
        const nextState = {...state};
        for (const group of action.data) {
            nextState[group.id] = group;
        }
        return nextState;
    }
    case GroupTypes.RECEIVED_GROUPS_ASSOCIATED_TO_TEAM:
    case GroupTypes.RECEIVED_GROUPS_ASSOCIATED_TO_CHANNEL: {
        const nextState = {...state};
        for (const group of action.data.groups) {
            nextState[group.id] = group;
        }
        return nextState;
    }
    default:
        return state;
    }
}

export default combineReducers({
    syncables,
    members,
    groups,
});
