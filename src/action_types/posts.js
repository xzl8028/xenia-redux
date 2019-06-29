// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import keyMirror from 'utils/key_mirror';

export default keyMirror({
    CREATE_POST_REQUEST: null,
    CREATE_POST_SUCCESS: null,
    CREATE_POST_FAILURE: null,
    CREATE_POST_RESET_REQUEST: null,

    EDIT_POST_REQUEST: null,
    EDIT_POST_SUCCESS: null,
    EDIT_POST_FAILURE: null,

    GET_POST_THREAD_REQUEST: null,
    GET_POST_THREAD_SUCCESS: null,
    GET_POST_THREAD_FAILURE: null,

    GET_POSTS_SUCCESS: null,
    GET_POSTS_SINCE_SUCCESS: null,

    GET_POST_THREAD_WITH_RETRY_ATTEMPT: null,
    GET_POSTS_WITH_RETRY_ATTEMPT: null,
    GET_POSTS_SINCE_WITH_RETRY_ATTEMPT: null,
    GET_POSTS_BEFORE_WITH_RETRY_ATTEMPT: null,
    GET_POSTS_AFTER_WITH_RETRY_ATTEMPT: null,

    RECEIVED_POST: null,
    RECEIVED_NEW_POST: null,

    RECEIVED_POSTS: null,
    RECEIVED_POSTS_AFTER: null,
    RECEIVED_POSTS_BEFORE: null,
    RECEIVED_POSTS_IN_CHANNEL: null,
    RECEIVED_POSTS_IN_THREAD: null,
    RECEIVED_POSTS_SINCE: null,

    POST_DELETED: null,
    POST_REMOVED: null,

    RECEIVED_FOCUSED_POST: null,
    RECEIVED_POST_SELECTED: null,
    RECEIVED_EDIT_POST: null,
    RECEIVED_REACTION: null,
    RECEIVED_REACTIONS: null,
    REACTION_DELETED: null,
    RECEIVED_OPEN_GRAPH_METADATA: null,

    ADD_MESSAGE_INTO_HISTORY: null,
    RESET_HISTORY_INDEX: null,
    MOVE_HISTORY_INDEX_BACK: null,
    MOVE_HISTORY_INDEX_FORWARD: null,
});
