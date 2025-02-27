// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {combineReducers} from 'redux';
import {IntegrationTypes, UserTypes, ChannelTypes} from 'action_types';

function incomingHooks(state = {}, action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_INCOMING_HOOK: {
        const nextState = {...state};
        nextState[action.data.id] = action.data;
        return nextState;
    }
    case IntegrationTypes.RECEIVED_INCOMING_HOOKS: {
        const nextState = {...state};
        for (const hook of action.data) {
            nextState[hook.id] = hook;
        }
        return nextState;
    }
    case IntegrationTypes.DELETED_INCOMING_HOOK: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }
    case ChannelTypes.RECEIVED_CHANNEL_DELETED: {
        const nextState = {...state};
        let deleted = false;
        Object.keys(nextState).forEach((id) => {
            if (nextState[id].channel_id === action.data.id) {
                deleted = true;
                Reflect.deleteProperty(nextState, id);
            }
        });

        if (deleted) {
            return nextState;
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function outgoingHooks(state = {}, action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_OUTGOING_HOOK: {
        const nextState = {...state};
        nextState[action.data.id] = action.data;
        return nextState;
    }
    case IntegrationTypes.RECEIVED_OUTGOING_HOOKS: {
        const nextState = {...state};
        for (const hook of action.data) {
            nextState[hook.id] = hook;
        }
        return nextState;
    }
    case IntegrationTypes.DELETED_OUTGOING_HOOK: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }
    case ChannelTypes.RECEIVED_CHANNEL_DELETED: {
        const nextState = {...state};
        let deleted = false;
        Object.keys(nextState).forEach((id) => {
            if (nextState[id].channel_id === action.data.id) {
                deleted = true;
                Reflect.deleteProperty(nextState, id);
            }
        });

        if (deleted) {
            return nextState;
        }

        return state;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function commands(state = {}, action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_COMMANDS:
    case IntegrationTypes.RECEIVED_CUSTOM_TEAM_COMMANDS: {
        const nextState = {...state};
        for (const command of action.data) {
            if (command.id) {
                const id = command.id;
                nextState[id] = command;
            }
        }

        return nextState;
    }
    case IntegrationTypes.RECEIVED_COMMAND:
        if (action.data.id) {
            return {
                ...state,
                [action.data.id]: action.data,
            };
        }

        return state;
    case IntegrationTypes.RECEIVED_COMMAND_TOKEN: {
        const {id, token} = action.data;
        return {
            ...state,
            [id]: {
                ...state[id],
                token,
            },
        };
    }
    case IntegrationTypes.DELETED_COMMAND: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function systemCommands(state = {}, action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_COMMANDS: {
        const nextCommands = {};
        for (const command of action.data) {
            if (!command.id) {
                nextCommands[command.trigger] = command;
            }
        }
        return nextCommands;
    }
    case IntegrationTypes.RECEIVED_COMMAND:
        if (!action.data.id) {
            return {
                ...state,
                [action.data.trigger]: action.data,
            };
        }

        return state;
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function oauthApps(state = {}, action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_OAUTH_APPS: {
        const nextState = {...state};
        for (const app of action.data) {
            nextState[app.id] = app;
        }
        return nextState;
    }
    case IntegrationTypes.RECEIVED_OAUTH_APP:
        return {
            ...state,
            [action.data.id]: action.data,
        };
    case IntegrationTypes.DELETED_OAUTH_APP: {
        const nextState = {...state};
        Reflect.deleteProperty(nextState, action.data.id);
        return nextState;
    }
    case UserTypes.LOGOUT_SUCCESS:
        return {};

    default:
        return state;
    }
}

function dialogTriggerId(state = '', action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_DIALOG_TRIGGER_ID:
        return action.data;
    default:
        return state;
    }
}

function dialog(state = '', action) {
    switch (action.type) {
    case IntegrationTypes.RECEIVED_DIALOG:
        return action.data;
    default:
        return state;
    }
}

export default combineReducers({

    // object where every key is the hook id and has an object with the incoming hook details
    incomingHooks,

    // object where every key is the hook id and has an object with the outgoing hook details
    outgoingHooks,

    // object to represent installed slash commands for a current team
    commands,

    // object to represent registered oauth apps with app id as the key
    oauthApps,

    // object to represent built-in slash commands
    systemCommands,

    // trigger ID for interactive dialogs
    dialogTriggerId,

    // data for an interactive dialog to display
    dialog,
});
