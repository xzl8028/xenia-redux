// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {ErrorTypes} from 'action_types';
import serializeError from 'serialize-error';
import {Client4} from 'client';
import EventEmitter from 'utils/event_emitter';

import type {DispatchFunc, ActionFunc} from 'types/actions';
import type {Error} from 'types/errors';

export function dismissErrorObject(index: number) {
    return {
        type: ErrorTypes.DISMISS_ERROR,
        index,
        data: null,
    };
}

export function dismissError(index: number): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch(dismissErrorObject(index));

        return {data: true};
    };
}

export function getLogErrorAction(error: Error, displayable: boolean = false) {
    return {
        type: ErrorTypes.LOG_ERROR,
        displayable,
        error,
        data: null,
    };
}

export function logError(error: Error, displayable: boolean = false): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        if (error.server_error_id === 'api.context.session_expired.app_error') {
            return {data: true};
        }

        const serializedError = serializeError(error);

        let sendToServer = true;
        if (error.stack && error.stack.includes('TypeError: Failed to fetch')) {
            sendToServer = false;
        }
        if (error.server_error_id) {
            sendToServer = false;
        }

        if (sendToServer) {
            try {
                const stringifiedSerializedError = JSON.stringify(serializedError).toString();
                await Client4.logClientError(stringifiedSerializedError);
            } catch (err) {
                // avoid crashing the app if an error sending
                // the error occurs.
            }
        }

        EventEmitter.emit(ErrorTypes.LOG_ERROR, error);
        dispatch(getLogErrorAction(serializedError, displayable));

        return {data: true};
    };
}

export function clearErrors(): ActionFunc {
    return async (dispatch: DispatchFunc) => {
        dispatch({type: ErrorTypes.CLEAR_ERRORS, data: null});

        return {data: true};
    };
}
