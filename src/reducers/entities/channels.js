// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {ChannelTypes, UserTypes, SchemeTypes, GroupTypes} from 'action_types';
import {General} from 'constants';

function channelListToSet(state, action) {
    const nextState = {...state};
    action.data.forEach((channel) => {
        const nextSet = new Set(nextState[channel.team_id]);
        nextSet.add(channel.id);
        nextState[channel.team_id] = nextSet;
    });

    return nextState;
}

function removeChannelFromSet(state, action) {
    const id = action.data.team_id;
    const nextSet = new Set(state[id]);
    nextSet.delete(action.data.id);
    return {
        ...state,
        [id]: nextSet,
    };
}

function currentChannelId(state = '', action) {
    switch (action.type) {
    case ChannelTypes.SELECT_CHANNEL:
        return action.data;
    case UserTypes.LOGOUT_SUCCESS:
        return '';
    default:
        return state;
    }
}

export function channels(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_CHANNEL:
        if (state[action.data.id] && action.data.type === General.DM_CHANNEL) {
            action.data.display_name = action.data.display_name || state[action.data.id].display_name;
        }
        return {
            ...state,
            [action.data.id]: action.data,
        };
    case ChannelTypes.RECEIVED_CHANNELS:
    case ChannelTypes.RECEIVED_ALL_CHANNELS:
    case SchemeTypes.RECEIVED_SCHEME_CHANNELS: {
        const nextState = {...state};
        for (const channel of action.data) {
            if (state[channel.id] && channel.type === General.DM_CHANNEL) {
                channel.display_name = channel.display_name || state[channel.id].display_name;
            }
            nextState[channel.id] = channel;
        }
        return nextState;
    }
    case ChannelTypes.RECEIVED_CHANNEL_DELETED: {
        const {id, deleteAt} = action.data;

        if (!state[id]) {
            return state;
        }

        return {
            ...state,
            [id]: {
                ...state[id],
                delete_at: deleteAt,
            },
        };
    }
    case ChannelTypes.UPDATE_CHANNEL_HEADER: {
        const {channelId, header} = action.data;

        if (!state[channelId]) {
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...state[channelId],
                header,
            },
        };
    }
    case ChannelTypes.UPDATE_CHANNEL_PURPOSE: {
        const {channelId, purpose} = action.data;

        if (!state[channelId]) {
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...state[channelId],
                purpose,
            },
        };
    }
    case ChannelTypes.LEAVE_CHANNEL: {
        if (action.data && action.data.type === General.PRIVATE_CHANNEL) {
            const nextState = {...state};
            Reflect.deleteProperty(nextState, action.data.id);
            return nextState;
        }
        return state;
    }
    case ChannelTypes.INCREMENT_TOTAL_MSG_COUNT: {
        const {channelId, amount} = action.data;
        const channel = state[channelId];

        if (!channel) {
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...channel,
                total_msg_count: channel.total_msg_count + amount,
            },
        };
    }
    case ChannelTypes.UPDATED_CHANNEL_SCHEME: {
        const {channelId, schemeId} = action.data;
        const channel = state[channelId];

        if (!channel) {
            return state;
        }

        return {...state, [channelId]: {...channel, scheme_id: schemeId}};
    }

    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function channelsInTeam(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_CHANNEL: {
        const nextSet = new Set(state[action.data.team_id]);
        nextSet.add(action.data.id);
        return {
            ...state,
            [action.data.team_id]: nextSet,
        };
    }
    case ChannelTypes.RECEIVED_CHANNELS: {
        return channelListToSet(state, action);
    }
    case ChannelTypes.LEAVE_CHANNEL: {
        if (action.data && action.data.type === General.PRIVATE_CHANNEL) {
            return removeChannelFromSet(state, action);
        }
        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function myMembers(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER: {
        const channelMember = action.data;
        return {
            ...state,
            [channelMember.channel_id]: channelMember,
        };
    }
    case ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS: {
        const nextState = {...state};
        const remove = action.remove;
        if (remove) {
            remove.forEach((id) => {
                Reflect.deleteProperty(nextState, id);
            });
        }

        for (const cm of action.data) {
            nextState[cm.channel_id] = cm;
        }
        return nextState;
    }
    case ChannelTypes.RECEIVED_CHANNEL_PROPS: {
        const member = {...state[action.data.channel_id]};
        member.notify_props = action.data.notifyProps;

        return {
            ...state,
            [action.data.channel_id]: member,
        };
    }
    case ChannelTypes.INCREMENT_UNREAD_MSG_COUNT: {
        const {channelId, amount, onlyMentions} = action.data;
        const member = state[channelId];

        if (!member) {
            // Don't keep track of unread posts until we've loaded the actual channel member
            return state;
        }

        if (!onlyMentions) {
            // Incrementing the msg_count marks the channel as read, so don't do that if these posts should be unread
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...member,
                msg_count: member.msg_count + amount,
            },
        };
    }
    case ChannelTypes.DECREMENT_UNREAD_MSG_COUNT: {
        const {channelId, amount} = action.data;

        const member = state[channelId];

        if (!member) {
            // Don't keep track of unread posts until we've loaded the actual channel member
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...member,
                msg_count: member.msg_count + amount,
            },
        };
    }
    case ChannelTypes.INCREMENT_UNREAD_MENTION_COUNT: {
        const {channelId, amount} = action.data;
        const member = state[channelId];

        if (!member) {
            // Don't keep track of unread posts until we've loaded the actual channel member
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...member,
                mention_count: member.mention_count + amount,
            },
        };
    }
    case ChannelTypes.DECREMENT_UNREAD_MENTION_COUNT: {
        const {channelId, amount} = action.data;
        const member = state[channelId];

        if (!member) {
            // Don't keep track of unread posts until we've loaded the actual channel member
            return state;
        }

        return {
            ...state,
            [channelId]: {
                ...member,
                mention_count: Math.max(member.mention_count - amount, 0),
            },
        };
    }
    case ChannelTypes.RECEIVED_LAST_VIEWED_AT: {
        const {data} = action;
        let member = state[data.channel_id];

        member = {
            ...member,
            last_viewed_at: data.last_viewed_at,
        };

        return {
            ...state,
            [action.data.channel_id]: member,
        };
    }
    case ChannelTypes.LEAVE_CHANNEL: {
        const nextState = {...state};
        if (action.data) {
            Reflect.deleteProperty(nextState, action.data.id);
            return nextState;
        }

        return state;
    }
    case ChannelTypes.UPDATED_CHANNEL_MEMBER_SCHEME_ROLES: {
        return updateChannelMemberSchemeRoles(state, action);
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function membersInChannel(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_MY_CHANNEL_MEMBER:
    case ChannelTypes.RECEIVED_CHANNEL_MEMBER: {
        const member = action.data;
        const members = {...(state[member.channel_id] || {})};
        members[member.user_id] = member;
        return {
            ...state,
            [member.channel_id]: members,
        };
    }
    case ChannelTypes.RECEIVED_MY_CHANNEL_MEMBERS:
    case ChannelTypes.RECEIVED_CHANNEL_MEMBERS: {
        const nextState = {...state};
        const remove = action.remove;
        const currentUserId = action.currentUserId;
        if (remove && currentUserId) {
            remove.forEach((id) => {
                if (nextState[id]) {
                    Reflect.deleteProperty(nextState[id], currentUserId);
                }
            });
        }

        for (const cm of action.data) {
            if (nextState[cm.channel_id]) {
                nextState[cm.channel_id] = {...nextState[cm.channel_id]};
            } else {
                nextState[cm.channel_id] = {};
            }
            nextState[cm.channel_id][cm.user_id] = cm;
        }
        return nextState;
    }
    case ChannelTypes.LEAVE_CHANNEL:
    case UserTypes.RECEIVED_PROFILE_NOT_IN_CHANNEL: {
        if (action.data) {
            const data = action.data;
            const members = {...(state[data.id] || {})};
            if (members) {
                Reflect.deleteProperty(members, data.user_id);
                return {
                    ...state,
                    [data.id]: members,
                };
            }
        }

        return state;
    }
    case ChannelTypes.UPDATED_CHANNEL_MEMBER_SCHEME_ROLES: {
        return updateChannelMemberSchemeRoles(state, action);
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function stats(state = {}, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_CHANNEL_STATS: {
        const nextState = {...state};
        const stat = action.data;
        nextState[stat.channel_id] = stat;

        return nextState;
    }
    case ChannelTypes.ADD_CHANNEL_MEMBER_SUCCESS: {
        const nextState = {...state};
        const id = action.id;
        const nextStat = nextState[id];
        if (nextStat) {
            const count = nextStat.member_count + 1;
            return {
                ...nextState,
                [id]: {
                    ...nextStat,
                    member_count: count,
                },
            };
        }

        return state;
    }
    case ChannelTypes.REMOVE_CHANNEL_MEMBER_SUCCESS: {
        const nextState = {...state};
        const id = action.id;
        const nextStat = nextState[id];
        if (nextStat) {
            const count = nextStat.member_count - 1;
            return {
                ...nextState,
                [id]: {
                    ...nextStat,
                    member_count: count || 1,
                },
            };
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};
    default:
        return state;
    }
}

function groupsAssociatedToChannel(state = {}, action) {
    switch (action.type) {
    case GroupTypes.RECEIVED_GROUPS_ASSOCIATED_TO_CHANNEL: {
        const {channelID, groups, totalGroupCount} = action.data;
        const nextState = {...state};
        const associatedGroupIDs = new Set(state[channelID] ? state[channelID].ids : []);
        for (const group of groups) {
            associatedGroupIDs.add(group.id);
        }
        nextState[channelID] = {ids: Array.from(associatedGroupIDs), totalCount: totalGroupCount};
        return nextState;
    }
    case GroupTypes.RECEIVED_ALL_GROUPS_ASSOCIATED_TO_CHANNEL: {
        const {channelID, groups} = action.data;
        const nextState = {...state};
        const associatedGroupIDs = new Set([]);
        for (const group of groups) {
            associatedGroupIDs.add(group.id);
        }
        const ids = Array.from(associatedGroupIDs);
        nextState[channelID] = {ids, totalCount: ids.length};
        return nextState;
    }
    case GroupTypes.RECEIVED_GROUPS_NOT_ASSOCIATED_TO_CHANNEL: {
        const {channelID, groups} = action.data;
        const nextState = {...state};
        const associatedGroupIDs = new Set(state[channelID] ? state[channelID].ids : []);
        for (const group of groups) {
            associatedGroupIDs.delete(group.id);
        }
        nextState[channelID] = Array.from(associatedGroupIDs);
        return nextState;
    }
    default:
        return state;
    }
}

function updateChannelMemberSchemeRoles(state, action) {
    const {channelId, userId, isSchemeUser, isSchemeAdmin} = action.data;
    const channel = state[channelId];
    if (channel) {
        const member = channel[userId];
        if (member) {
            return {
                ...state,
                [channelId]: {
                    ...state[channelId],
                    [userId]: {
                        ...state[channelId][userId],
                        scheme_user: isSchemeUser,
                        scheme_admin: isSchemeAdmin,
                    },
                },
            };
        }
    }
    return state;
}

function totalCount(state = 0, action) {
    switch (action.type) {
    case ChannelTypes.RECEIVED_TOTAL_CHANNEL_COUNT: {
        return action.data;
    }
    default:
        return state;
    }
}

export default combineReducers({

    // the current selected channel
    currentChannelId,

    // object where every key is the channel id and has and object with the channel detail
    channels,

    // object where every key is a team id and has set of channel ids that are on the team
    channelsInTeam,

    // object where every key is the channel id and has an object with the channel members detail
    myMembers,

    // object where every key is the channel id with an object where key is a user id and has an object with the channel members detail
    membersInChannel,

    // object where every key is the channel id and has an object with the channel stats
    stats,

    groupsAssociatedToChannel,

    totalCount,
});
