// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import {createSelector} from 'reselect';
import {createIdsSelector} from 'utils/helpers';

import type {GlobalState} from 'types/store';
import type {CustomEmoji} from 'types/emojis';
import type {IDMappedObjects} from 'types/utilities';

export function getCustomEmojis(state: GlobalState): IDMappedObjects<CustomEmoji> {
    if (state.entities.general.config.EnableCustomEmoji !== 'true') {
        return {};
    }
    return state.entities.emojis.customEmoji;
}

export const getCustomEmojisAsMap: (state: GlobalState) => Map<string, CustomEmoji> = createSelector(
    getCustomEmojis,
    (emojis) => {
        const map = new Map();
        Object.keys(emojis).forEach((key: string) => {
            map.set(key, emojis[key]);
        });
        return map;
    }
);

export const getCustomEmojisByName: (state: GlobalState) => Map<string, CustomEmoji> = createSelector(
    getCustomEmojis,
    (emojis: IDMappedObjects<CustomEmoji>): Map<string, CustomEmoji> => {
        const map: Map<string, CustomEmoji> = new Map();

        Object.keys(emojis).forEach((key: string) => {
            map.set(emojis[key].name, emojis[key]);
        });

        return map;
    }
);

export const getCustomEmojiIdsSortedByName: (state: GlobalState) => Array<string> = createIdsSelector(
    (state) => state.entities.emojis.customEmoji,
    (emojis: IDMappedObjects<CustomEmoji>): Array<string> => {
        return Object.keys(emojis).sort(
            (a: string, b: string): number => emojis[a].name.localeCompare(emojis[b].name)
        );
    }
);
