// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import type {IDMappedObjects, UserIDMappedObjects, RelationOneToMany, RelationOneToOne} from './utilities';
import type {Team} from './teams';

export type ChannelType = 'O' | 'P' | 'D' | 'G';

export type ChannelStats = {|
    channel_id: string,
    member_count: number
|};

export type ChannelNotifyProps = {|
    desktop: 'default' | 'all' | 'mention' | 'none',
    email: 'default' | 'all' | 'mention' | 'none',
    mark_unread: 'all' | 'mention',
    push: 'default' | 'all' | 'mention' | 'none',
    ignore_channel_mentions: 'default' | 'off' | 'on',
|};

export type Channel = {|
    id: string,
    create_at: number,
    update_at: number,
    delete_at: number,
    team_id: string,
    type: ChannelType,
    display_name: string,
    name: string,
    header: string,
    purpose: string,
    last_post_at: number,
    total_msg_count: number,
    extra_update_at: number,
    creator_id: string,
    scheme_id: string,
    isCurrent?: boolean,
    teammate_id?: string,
    status?: string,
    fake?: boolean,
    group_constrained: boolean,
|};

export type ChannelMembership = {|
    channel_id: string,
    user_id: string,
    roles: string,
    last_viewed_at: number,
    msg_count: number,
    mention_count: number,
    notify_props: ChannelNotifyProps,
    last_update_at: number,
    scheme_user: boolean,
    scheme_admin: boolean,
    post_root_id?: string
|}

export type ChannelsState = {|
    currentChannelId: string,
    channels: IDMappedObjects<Channel>,
    channelsInTeam: RelationOneToMany<Team, Channel>,
    myMembers: RelationOneToOne<Channel, ChannelMembership>,
    membersInChannel: RelationOneToOne<Channel, UserIDMappedObjects<ChannelMembership>>,
    stats: RelationOneToOne<Channel, ChannelStats>,
    groupsAssociatedToChannel: Object,
    totalCount: number,
|};
