// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {combineReducers} from 'redux';
import {TeamTypes} from 'action_types';

import {handleRequest, initialRequestState} from './helpers';

import type {GenericAction} from 'types/actions';
import type {TeamsRequestsStatuses, RequestStatusType} from 'types/requests';

function getMyTeams(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        TeamTypes.MY_TEAMS_REQUEST,
        TeamTypes.MY_TEAMS_SUCCESS,
        TeamTypes.MY_TEAMS_FAILURE,
        state,
        action
    );
}

function getTeams(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        TeamTypes.GET_TEAMS_REQUEST,
        TeamTypes.GET_TEAMS_SUCCESS,
        TeamTypes.GET_TEAMS_FAILURE,
        state,
        action
    );
}

function joinTeam(state: RequestStatusType = initialRequestState(), action: GenericAction): RequestStatusType {
    return handleRequest(
        TeamTypes.JOIN_TEAM_REQUEST,
        TeamTypes.JOIN_TEAM_SUCCESS,
        TeamTypes.JOIN_TEAM_FAILURE,
        state,
        action
    );
}

export default (combineReducers({
    getTeams,
    getMyTeams,
    joinTeam,
}): (TeamsRequestsStatuses, GenericAction) => TeamsRequestsStatuses);
