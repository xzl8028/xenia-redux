// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

export type Role = {|
    id: string,
    name: string,
    display_name: string,
    description: string,
    create_at: number,
    update_at: number,
    delete_at: number,
    permissions: Array<string>,
    scheme_managed: boolean,
    built_in: boolean,
|}
