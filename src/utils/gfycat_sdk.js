// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import Gfycat from 'gfycat-sdk';

const defaultKey = '2_KtH_W5';
const defaultSecret = '3wLVZPiswc3DnaiaFoLkDvB4X0IV6CpMkj4tf2inJRsBY6-FnkT08zGmppWFgeof';

let activeKey = null;
let activeSecret = null;
let instance = null;

export default function(key: string, secret: string): Gfycat {
    if (instance && activeKey === key && activeSecret === secret) {
        return instance;
    }

    if (!key || !secret) {
        instance = new Gfycat({client_id: defaultKey, client_secret: defaultSecret});
        return instance;
    }

    activeKey = key;
    activeSecret = secret;
    instance = new Gfycat({client_id: key, client_secret: secret});
    return instance;
}
