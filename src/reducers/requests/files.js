// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {combineReducers} from 'redux';
import {FileTypes} from 'action_types';
import {RequestStatus} from 'constants';

import {initialRequestState} from './helpers';

import type {GenericAction} from 'types/actions';
import type {FilesRequestsStatuses, RequestStatusType} from 'types/requests';

export function handleUploadFilesRequest(
    REQUEST: string,
    SUCCESS: string,
    FAILURE: string,
    CANCEL: string,
    state: RequestStatusType,
    action: GenericAction
): RequestStatusType {
    switch (action.type) {
    case REQUEST:
        return {
            ...state,
            status: RequestStatus.STARTED,
        };
    case SUCCESS:
        return {
            ...state,
            status: RequestStatus.SUCCESS,
            error: null,
        };
    case FAILURE: {
        let error = action.error;

        if (error instanceof Error) {
            error = error.hasOwnProperty('intl') ? {...error} : error.toString();
        }

        return {
            ...state,
            status: RequestStatus.FAILURE,
            error,
        };
    }
    case CANCEL:
        return {
            ...state,
            status: RequestStatus.CANCELLED,
            error: null,
        };
    default:
        return state;
    }
}

function uploadFiles(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleUploadFilesRequest(
        FileTypes.UPLOAD_FILES_REQUEST,
        FileTypes.UPLOAD_FILES_SUCCESS,
        FileTypes.UPLOAD_FILES_FAILURE,
        FileTypes.UPLOAD_FILES_CANCEL,
        state,
        action
    );
}

export default (combineReducers({
    uploadFiles,
}): (FilesRequestsStatuses, GenericAction) => FilesRequestsStatuses);
