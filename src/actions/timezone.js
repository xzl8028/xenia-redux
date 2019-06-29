// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow
import {getCurrentUser} from 'selectors/entities/users';
import {getUserTimezone} from 'selectors/entities/timezone';
import {updateMe} from 'actions/users';
import type {DispatchFunc, GetStateFunc} from 'types/actions';

export function autoUpdateTimezone(deviceTimezone: string) {
    return async (dispatch: DispatchFunc, getState: GetStateFunc) => {
        const currentUer = getCurrentUser(getState());
        const currentTimezone = getUserTimezone(getState(), currentUer.id);
        const newTimezoneExists = currentTimezone.automaticTimezone !== deviceTimezone;

        if (currentTimezone.useAutomaticTimezone && newTimezoneExists) {
            const timezone = {
                useAutomaticTimezone: 'true',
                automaticTimezone: deviceTimezone,
                manualTimezone: currentTimezone.manualTimezone,
            };

            const updatedUser = {
                ...currentUer,
                timezone,
            };

            updateMe(updatedUser)(dispatch, getState);
        }
    };
}
