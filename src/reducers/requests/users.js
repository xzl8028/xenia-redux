// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {combineReducers} from 'redux';
import {RequestStatus} from 'constants';
import {UserTypes} from 'action_types';

import {handleRequest, initialRequestState} from './helpers';

import type {GenericAction} from 'types/actions';
import type {UsersRequestsStatuses, RequestStatusType} from 'types/requests';

function checkMfa(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    switch (action.type) {
    case UserTypes.CHECK_MFA_REQUEST:
        return {...state, status: RequestStatus.STARTED};

    case UserTypes.CHECK_MFA_SUCCESS:
        return {...state, status: RequestStatus.SUCCESS, error: null};

    case UserTypes.CHECK_MFA_FAILURE:
        return {...state, status: RequestStatus.FAILURE, error: action.error};

    case UserTypes.LOGOUT_SUCCESS:
        return {...state, status: RequestStatus.NOT_STARTED, error: null};

    default:
        return state;
    }
}

function login(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    switch (action.type) {
    case UserTypes.LOGIN_REQUEST:
        return {...state, status: RequestStatus.STARTED};

    case UserTypes.LOGIN_SUCCESS:
        return {...state, status: RequestStatus.SUCCESS, error: null};

    case UserTypes.LOGIN_FAILURE:
        return {...state, status: RequestStatus.FAILURE, error: action.error};

    case UserTypes.LOGOUT_SUCCESS:
        return {...state, status: RequestStatus.NOT_STARTED, error: null};

    default:
        return state;
    }
}

function logout(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    switch (action.type) {
    case UserTypes.LOGOUT_REQUEST:
        return {...state, status: RequestStatus.STARTED};

    case UserTypes.LOGOUT_SUCCESS:
        return {...state, status: RequestStatus.SUCCESS, error: null};

    case UserTypes.LOGOUT_FAILURE:
        return {...state, status: RequestStatus.FAILURE, error: action.error};

    case UserTypes.RESET_LOGOUT_STATE:
        return initialRequestState();

    default:
        return state;
    }
}

function autocompleteUsers(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        UserTypes.AUTOCOMPLETE_USERS_REQUEST,
        UserTypes.AUTOCOMPLETE_USERS_SUCCESS,
        UserTypes.AUTOCOMPLETE_USERS_FAILURE,
        state,
        action
    );
}

function updateMe(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        UserTypes.UPDATE_ME_REQUEST,
        UserTypes.UPDATE_ME_SUCCESS,
        UserTypes.UPDATE_ME_FAILURE,
        state,
        action
    );
}

export default (combineReducers({
    checkMfa,
    login,
    logout,
    autocompleteUsers,
    updateMe,
}): (UsersRequestsStatuses, GenericAction) => UsersRequestsStatuses);
