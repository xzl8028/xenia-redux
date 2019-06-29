// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

export type Error = {|
    server_error_id?: string,
    stack?: string,
    message: string,
    status_code?: number,
|};
