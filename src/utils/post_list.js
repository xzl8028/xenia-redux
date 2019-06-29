// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {createSelector} from 'reselect';
import moment from 'moment-timezone';

import {Posts, Preferences} from 'constants';

import {makeGetPostsForIds} from 'selectors/entities/posts';
import {getBool} from 'selectors/entities/preferences';
import {isTimezoneEnabled} from 'selectors/entities/timezone';
import {getCurrentUser} from 'selectors/entities/users';

import {createIdsSelector, memoizeResult} from 'utils/helpers';
import {isUserActivityPost, shouldFilterJoinLeavePost} from 'utils/post_utils';
import {getUserCurrentTimezone} from 'utils/timezone_utils';

export const COMBINED_USER_ACTIVITY = 'user-activity-';
export const DATE_LINE = 'date-';
export const START_OF_NEW_MESSAGES = 'start-of-new-messages';
export const MAX_COMBINED_SYSTEM_POSTS = 100;

function shouldShowJoinLeaveMessages(state) {
    // This setting is true or not set if join/leave messages are to be displayed
    return getBool(state, Preferences.CATEGORY_ADVANCED_SETTINGS, Preferences.ADVANCED_FILTER_JOIN_LEAVE, true);
}

export function makePreparePostIdsForPostList() {
    const filterPostsAndAddSeparators = makeFilterPostsAndAddSeparators();
    const combineUserActivityPosts = makeCombineUserActivityPosts();

    return (state, options) => {
        let postIds = filterPostsAndAddSeparators(state, options);
        postIds = combineUserActivityPosts(state, postIds);

        return postIds;
    };
}

// Returns a selector that, given the state and an object containing an array of postIds and an optional
// timestamp of when the channel was last read, returns a memoized array of postIds interspersed with
// day indicators and an optional new message indicator.
export function makeFilterPostsAndAddSeparators() {
    const getPostsForIds = makeGetPostsForIds();

    return createIdsSelector(
        (state, {postIds}) => getPostsForIds(state, postIds),
        (state, {lastViewedAt}) => lastViewedAt,
        (state, {indicateNewMessages}) => indicateNewMessages,
        (state) => state.entities.posts.selectedPostId,
        getCurrentUser,
        shouldShowJoinLeaveMessages,
        isTimezoneEnabled,
        (posts, lastViewedAt, indicateNewMessages, selectedPostId, currentUser, showJoinLeave, timeZoneEnabled) => {
            if (posts.length === 0 || !currentUser) {
                return [];
            }

            const out = [];

            let lastDate = null;
            let addedNewMessagesIndicator = false;

            // Iterating through the posts from oldest to newest
            for (let i = posts.length - 1; i >= 0; i--) {
                const post = posts[i];

                if (
                    !post ||
                    (post.type === Posts.POST_TYPES.EPHEMERAL_ADD_TO_CHANNEL && !selectedPostId)
                ) {
                    continue;
                }

                // Filter out join/leave messages if necessary
                if (shouldFilterJoinLeavePost(post, showJoinLeave, currentUser.username)) {
                    continue;
                }

                // Push on a date header if the last post was on a different day than the current one
                const postDate = new Date(post.create_at);
                if (timeZoneEnabled) {
                    const currentOffset = postDate.getTimezoneOffset() * 60 * 1000;
                    const timezone = getUserCurrentTimezone(currentUser.timezone);
                    if (timezone) {
                        const timezoneOffset = moment.tz.zone(timezone).utcOffset(post.create_at) * 60 * 1000;
                        postDate.setTime(post.create_at + (currentOffset - timezoneOffset));
                    }
                }

                postDate.setHours(0, 0, 0, 0);

                if (!lastDate || lastDate.toDateString() !== postDate.toDateString()) {
                    out.push(DATE_LINE + postDate.getTime());

                    lastDate = postDate;
                }

                if (
                    lastViewedAt &&
                    post.create_at > lastViewedAt &&
                    post.user_id !== currentUser.id &&
                    !addedNewMessagesIndicator &&
                    indicateNewMessages
                ) {
                    out.push(START_OF_NEW_MESSAGES);
                    addedNewMessagesIndicator = true;
                }

                out.push(post.id);
            }

            // Flip it back to newest to oldest
            return out.reverse();
        }
    );
}

export function makeCombineUserActivityPosts() {
    return createIdsSelector(
        (state, postIds) => postIds,
        (state) => state.entities.posts.posts,
        (postIds, posts) => {
            let lastPostIsUserActivity = false;
            let combinedCount = 0;

            const out = [];
            let changed = false;

            for (let i = 0; i < postIds.length; i++) {
                const postId = postIds[i];

                if (postId === START_OF_NEW_MESSAGES || postId.startsWith(DATE_LINE)) {
                    // Not a post, so it won't be combined
                    out.push(postId);

                    lastPostIsUserActivity = false;
                    combinedCount = 0;

                    continue;
                }

                const post = posts[postId];
                const postIsUserActivity = isUserActivityPost(post.type);

                if (postIsUserActivity && lastPostIsUserActivity && combinedCount < MAX_COMBINED_SYSTEM_POSTS) {
                    // Add the ID to the previous combined post
                    out[out.length - 1] += '_' + postId;

                    combinedCount += 1;

                    changed = true;
                } else if (postIsUserActivity) {
                    // Start a new combined post, even if the "combined" post is only a single post
                    out.push(COMBINED_USER_ACTIVITY + postId);

                    combinedCount = 1;

                    changed = true;
                } else {
                    out.push(postId);

                    combinedCount = 0;
                }

                lastPostIsUserActivity = postIsUserActivity;
            }

            if (!changed) {
                // Nothing was combined, so return the original array
                return postIds;
            }

            return out;
        },
    );
}

export function isStartOfNewMessages(item) {
    return item === START_OF_NEW_MESSAGES;
}

export function isDateLine(item) {
    return item.startsWith(DATE_LINE);
}

export function getDateForDateLine(item) {
    return parseInt(item.substring(DATE_LINE.length), 10);
}

export function isCombinedUserActivityPost(item) {
    return (/^user-activity-(?:[^_]+_)*[^_]+$/).test(item);
}

export function getPostIdsForCombinedUserActivityPost(item) {
    return item.substring(COMBINED_USER_ACTIVITY.length).split('_');
}

export function getFirstPostId(items) {
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (isStartOfNewMessages(item) || isDateLine(item)) {
            // This is not a post at all
            continue;
        }

        if (isCombinedUserActivityPost(item)) {
            // This is a combined post, so find the first post ID from it
            const combinedIds = getPostIdsForCombinedUserActivityPost(item);

            return combinedIds[0];
        }

        // This is a post ID
        return item;
    }

    return '';
}

export function getLastPostId(items) {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];

        if (isStartOfNewMessages(item) || isDateLine(item)) {
            // This is not a post at all
            continue;
        }

        if (isCombinedUserActivityPost(item)) {
            // This is a combined post, so find the first post ID from it
            const combinedIds = getPostIdsForCombinedUserActivityPost(item);

            return combinedIds[combinedIds.length - 1];
        }

        // This is a post ID
        return item;
    }

    return '';
}

export function getLastPostIndex(postIds) {
    let index = 0;
    for (let i = postIds.length - 1; i > 0; i--) {
        const item = postIds[i];
        if (!isStartOfNewMessages(item) && !isDateLine(item)) {
            index = i;
            break;
        }
    }

    return index;
}

export function makeGenerateCombinedPost() {
    const getPostsForIds = makeGetPostsForIds();
    const getPostIds = memoizeResult(getPostIdsForCombinedUserActivityPost);

    return createSelector(
        (state, combinedId) => combinedId,
        (state, combinedId) => getPostsForIds(state, getPostIds(combinedId)),
        (combinedId, posts) => {
            // All posts should be in the same channel
            const channelId = posts[0].channel_id;

            // Assume that the last post is the oldest one
            const createAt = posts[posts.length - 1].create_at;

            const messages = posts.map((post) => post.message);

            return {
                id: combinedId,
                root_id: '',
                channel_id: channelId,
                create_at: createAt,
                delete_at: 0,
                message: messages.join('\n'),
                props: {
                    messages,
                    user_activity: combineUserActivitySystemPost(posts),
                },
                state: '',
                system_post_ids: posts.map((post) => post.id),
                type: Posts.POST_TYPES.COMBINED_USER_ACTIVITY,
                user_activity_posts: posts,
                user_id: '',
                metadata: {},
            };
        }
    );
}

export const postTypePriority = {
    [Posts.POST_TYPES.JOIN_TEAM]: 0,
    [Posts.POST_TYPES.ADD_TO_TEAM]: 1,
    [Posts.POST_TYPES.LEAVE_TEAM]: 2,
    [Posts.POST_TYPES.REMOVE_FROM_TEAM]: 3,
    [Posts.POST_TYPES.JOIN_CHANNEL]: 4,
    [Posts.POST_TYPES.ADD_TO_CHANNEL]: 5,
    [Posts.POST_TYPES.LEAVE_CHANNEL]: 6,
    [Posts.POST_TYPES.REMOVE_FROM_CHANNEL]: 7,
    [Posts.POST_TYPES.PURPOSE_CHANGE]: 8,
    [Posts.POST_TYPES.HEADER_CHANGE]: 9,
    [Posts.POST_TYPES.JOIN_LEAVE]: 10,
    [Posts.POST_TYPES.DISPLAYNAME_CHANGE]: 11,
    [Posts.POST_TYPES.CONVERT_CHANNEL]: 12,
    [Posts.POST_TYPES.CHANNEL_DELETED]: 13,
    [Posts.POST_TYPES.ADD_REMOVE]: 14,
    [Posts.POST_TYPES.EPHEMERAL]: 15,
};

export function comparePostTypes(a, b) {
    return postTypePriority[a.postType] - postTypePriority[b.postType];
}

function extractUserActivityData(userActivities) {
    const messageData = [];
    const allUserIds = [];
    const allUsernames = [];

    Object.entries(userActivities).forEach(([postType, values]) => {
        if (
            postType === Posts.POST_TYPES.ADD_TO_TEAM ||
            postType === Posts.POST_TYPES.ADD_TO_CHANNEL ||
            postType === Posts.POST_TYPES.REMOVE_FROM_CHANNEL
        ) {
            Object.keys(values).map((key) => [key, values[key]]).forEach(([actorId, users]) => {
                if (Array.isArray(users)) {
                    throw new Error('Invalid Post activity data');
                }
                const {ids, usernames} = users;
                messageData.push({postType, userIds: [...usernames, ...ids], actorId});
                if (ids.length > 0) {
                    allUserIds.push(...ids);
                }

                if (usernames.length > 0) {
                    allUsernames.push(...usernames);
                }
                allUserIds.push(actorId);
            });
        } else {
            if (!Array.isArray(values)) {
                throw new Error('Invalid Post activity data');
            }
            messageData.push({postType, userIds: values});
            allUserIds.push(...values);
        }
    });

    messageData.sort(comparePostTypes);

    function reduceUsers(acc, curr) {
        if (!acc.includes(curr)) {
            acc.push(curr);
        }
        return acc;
    }

    return {
        allUserIds: allUserIds.reduce(reduceUsers, []),
        allUsernames: allUsernames.reduce(reduceUsers, []),
        messageData,
    };
}

export function combineUserActivitySystemPost(systemPosts = []) {
    if (systemPosts.length === 0) {
        return null;
    }

    const userActivities = systemPosts.reduce((acc, post) => {
        const postType = post.type;
        let userActivityProps = acc;
        const combinedPostType = userActivityProps[postType];

        if (
            postType === Posts.POST_TYPES.ADD_TO_TEAM ||
            postType === Posts.POST_TYPES.ADD_TO_CHANNEL ||
            postType === Posts.POST_TYPES.REMOVE_FROM_CHANNEL
        ) {
            const userId = post.props.addedUserId || post.props.removedUserId;
            const username = post.props.addedUsername || post.props.removedUsername;
            if (combinedPostType) {
                if (Array.isArray(combinedPostType[post.user_id])) {
                    throw new Error('Invalid Post activity data');
                }
                const users = combinedPostType[post.user_id] || {ids: [], usernames: []};
                if (userId) {
                    if (!users.ids.includes(userId)) {
                        users.ids.push(userId);
                    }
                } else if (username && !users.usernames.includes(username)) {
                    users.usernames.push(username);
                }
                combinedPostType[post.user_id] = users;
            } else {
                const users = {ids: [], usernames: []};
                if (userId) {
                    users.ids.push(userId);
                } else if (username) {
                    users.usernames.push(username);
                }
                userActivityProps[postType] = {
                    [post.user_id]: users,
                };
            }
        } else {
            const propsUserId = post.user_id;

            if (combinedPostType) {
                if (!Array.isArray(combinedPostType)) {
                    throw new Error('Invalid Post activity data');
                }
                if (!combinedPostType.includes(propsUserId)) {
                    userActivityProps[postType] = [...combinedPostType, propsUserId];
                }
            } else {
                userActivityProps = {...userActivityProps, [postType]: [propsUserId]};
            }
        }

        return userActivityProps;
    }, {});

    return extractUserActivityData(userActivities);
}
