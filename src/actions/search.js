// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {batchActions} from 'redux-batched-actions';

import {Client4} from 'client';
import {SearchTypes} from 'action_types';

import {getCurrentTeamId} from 'selectors/entities/teams';
import {getCurrentUserId, getCurrentUserMentionKeys} from 'selectors/entities/users';

import {getChannelAndMyMember, getChannelMembers} from './channels';
import {forceLogoutIfNecessary} from './helpers';
import {logError} from './errors';
import {
    getProfilesAndStatusesForPosts,
    receivedPosts,
} from './posts';

const WEBAPP_SEARCH_PER_PAGE = 20;

export function getMissingChannelsFromPosts(posts) {
    return async (dispatch, getState) => {
        const {channels, membersInChannel, myMembers} = getState().entities.channels;
        const promises = [];

        Object.values(posts).forEach((post) => {
            const id = post.channel_id;
            if (!channels[id] || !myMembers[id]) {
                promises.push(dispatch(getChannelAndMyMember(id)));
            }

            if (!membersInChannel[id]) {
                promises.push(dispatch(getChannelMembers(id)));
            }
        });

        return Promise.all(promises);
    };
}

export function searchPostsWithParams(teamId, params) {
    return async (dispatch, getState) => {
        const isGettingMore = (params.page > 0);
        dispatch({
            type: SearchTypes.SEARCH_POSTS_REQUEST,
            isGettingMore,
        });

        let posts;
        try {
            posts = await Client4.searchPostsWithParams(teamId, params);

            await Promise.all([
                getProfilesAndStatusesForPosts(posts.posts, dispatch, getState),
                dispatch(getMissingChannelsFromPosts(posts.posts)),
            ]);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: SearchTypes.SEARCH_POSTS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: posts,
                isGettingMore,
            },
            receivedPosts(posts),
            {
                type: SearchTypes.RECEIVED_SEARCH_TERM,
                data: {
                    teamId,
                    params,
                    isEnd: (posts.order.length < params.per_page),
                },
            },
            {
                type: SearchTypes.SEARCH_POSTS_SUCCESS,
            },
        ], 'SEARCH_POST_BATCH'));

        return {data: posts};
    };
}

export function searchPosts(teamId, terms, isOrSearch, includeDeletedChannels) {
    return searchPostsWithParams(teamId, {terms, is_or_search: isOrSearch, include_deleted_channels: includeDeletedChannels, page: 0, per_page: WEBAPP_SEARCH_PER_PAGE});
}

export function getMorePostsForSearch() {
    return async (dispatch, getState) => {
        const teamId = getCurrentTeamId(getState());
        const {params, isEnd} = getState().entities.search.current[teamId];
        if (!isEnd) {
            const newParams = Object.assign({}, params);
            newParams.page += 1;
            return dispatch(searchPostsWithParams(teamId, newParams));
        }
        return {};
    };
}

export function clearSearch() {
    return async (dispatch) => {
        dispatch({type: SearchTypes.REMOVE_SEARCH_POSTS});

        return {data: true};
    };
}

export function getFlaggedPosts() {
    return async (dispatch, getState) => {
        const state = getState();
        const userId = getCurrentUserId(state);
        const teamId = getCurrentTeamId(state);

        dispatch({type: SearchTypes.SEARCH_FLAGGED_POSTS_REQUEST});

        let posts;
        try {
            posts = await Client4.getFlaggedPosts(userId, '', teamId);
            await Promise.all([
                getProfilesAndStatusesForPosts(posts.posts, dispatch, getState),
                dispatch(getMissingChannelsFromPosts(posts.posts)),
            ]);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: SearchTypes.SEARCH_FLAGGED_POSTS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_FLAGGED_POSTS,
                data: posts,
            },
            receivedPosts(posts),
            {
                type: SearchTypes.SEARCH_FLAGGED_POSTS_SUCCESS,
            },
        ], 'SEARCH_FLAGGED_POSTS_BATCH'));

        return {data: posts};
    };
}

export function getPinnedPosts(channelId) {
    return async (dispatch, getState) => {
        dispatch({type: SearchTypes.SEARCH_PINNED_POSTS_REQUEST});

        let result;
        try {
            result = await Client4.getPinnedPosts(channelId);
            await Promise.all([
                getProfilesAndStatusesForPosts(result.posts, dispatch, getState),
                dispatch(getMissingChannelsFromPosts(result.posts)),
            ]);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: SearchTypes.SEARCH_PINNED_POSTS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_PINNED_POSTS,
                data: {
                    pinned: result,
                    channelId,
                },
            },
            receivedPosts(result),
            {
                type: SearchTypes.SEARCH_PINNED_POSTS_SUCCESS,
            },
        ], 'SEARCH_PINNED_POSTS_BATCH'));

        return {data: result};
    };
}

export function clearPinnedPosts(channelId) {
    return async (dispatch) => {
        dispatch({
            type: SearchTypes.REMOVE_SEARCH_PINNED_POSTS,
            data: {
                channelId,
            },
        });

        return {data: true};
    };
}

export function getRecentMentions() {
    return async (dispatch, getState) => {
        const state = getState();
        const teamId = getCurrentTeamId(state);

        dispatch({type: SearchTypes.SEARCH_RECENT_MENTIONS_REQUEST});

        let posts;
        try {
            const termKeys = getCurrentUserMentionKeys(state).filter(({key}) => {
                return key !== '@channel' && key !== '@all' && key !== '@here';
            });

            const terms = termKeys.map(({key}) => key).join(' ').trim() + ' ';

            Client4.trackEvent('api', 'api_posts_search_mention');
            posts = await Client4.searchPosts(teamId, terms, true);

            await Promise.all([
                getProfilesAndStatusesForPosts(posts.posts, dispatch, getState),
                dispatch(getMissingChannelsFromPosts(posts.posts)),
            ]);
        } catch (error) {
            forceLogoutIfNecessary(error, dispatch, getState);
            dispatch(batchActions([
                {type: SearchTypes.SEARCH_RECENT_MENTIONS_FAILURE, error},
                logError(error),
            ]));
            return {error};
        }

        dispatch(batchActions([
            {
                type: SearchTypes.RECEIVED_SEARCH_POSTS,
                data: posts,
            },
            receivedPosts(posts),
            {
                type: SearchTypes.SEARCH_RECENT_MENTIONS_SUCCESS,
            },
        ], 'SEARCH_RECENT_MENTIONS_BATCH'));

        return {data: posts};
    };
}

export function removeSearchTerms(teamId, terms) {
    return async (dispatch) => {
        dispatch({
            type: SearchTypes.REMOVE_SEARCH_TERM,
            data: {
                teamId,
                terms,
            },
        });

        return {data: true};
    };
}

export default {
    clearSearch,
    removeSearchTerms,
    searchPosts,
};
