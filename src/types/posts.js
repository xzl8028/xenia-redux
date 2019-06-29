// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import type {CustomEmoji} from './emojis';
import type {FileInfo} from './files';
import type {Reaction} from './reactions';
import type {Channel} from './channels';
import type {
    $ID,
    RelationOneToOne,
    RelationOneToMany,
    IDMappedObjects,
} from './utilities';

export type PostType = 'system_add_remove' |
                       'system_add_to_channel' |
                       'system_add_to_team' |
                       'system_channel_deleted' |
                       'system_displayname_change' |
                       'system_convert_channel' |
                       'system_ephemeral' |
                       'system_header_change' |
                       'system_join_channel' |
                       'system_join_leave' |
                       'system_leave_channel' |
                       'system_purpose_change' |
                       'system_remove_from_channel';

export type PostEmbedType = 'image' | 'message_attachment' | 'opengraph';

export type PostEmbed = {|
    type: PostEmbedType,
    url: string,
    data: Object
|};

export type PostImage = {|
    height: number,
    width: number
|};

export type PostMetadata = {|
    embeds: Array<PostEmbed>,
    emojis: Array<CustomEmoji>,
    files: Array<FileInfo>,
    images: {[string]: PostImage},
    reactions: Array<Reaction>
|};

export type Post = {
    id: string,
    create_at: number,
    update_at: number,
    edit_at: number,
    delete_at: number,
    is_pinned: boolean,
    user_id: string,
    channel_id: string,
    root_id: string,
    parent_id: string,
    original_id: string,
    message: string,
    type: PostType,
    props: Object,
    hashtags: string,
    pending_post_id: string,
    metadata: PostMetadata,
    failed?: boolean,
    user_activity_posts?: Array<Post>,
    state?: 'DELETED',
};

export type PostWithFormatData = Post & {
    isFirstReply: boolean,
    isLastReply: boolean,
    previousPostIsComment: boolean,
    commentedOnPost: Post,
    consecutivePostByUser: boolean,
    replyCount: number,
    isCommentMention: boolean,
    highlight: boolean,
};

export type PostOrderBlock = {|
    order: Array<string>,
    recent: boolean,
|};

export type PostsState = {|
    posts: IDMappedObjects<Post>,
    postsInChannel: {[$ID<Channel>]: Array<PostOrderBlock>},
    postsInThread: RelationOneToMany<Post, Post>,
    reactions: RelationOneToOne<Post, {[string]: Reaction}>,
    openGraph: RelationOneToOne<Post, Object>,
    pendingPostIds: Array<string>,
    selectedPostId: string,
    currentFocusedPostId: string,
    messagesHistory: {|
        messages: Array<string>,
        index: {|
            post: number,
            comment: number
        |}
    |},
    expandedURLs: {[string]: string},
|};
