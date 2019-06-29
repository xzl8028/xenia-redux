// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
// @flow

import type {Team} from 'types/teams';
import type {IDMappedObjects} from 'types/utilities';
import {General} from 'constants';

export function teamListToMap(teamList: Array<Team>): IDMappedObjects<Team> {
    const teams = {};
    for (let i = 0; i < teamList.length; i++) {
        teams[teamList[i].id] = teamList[i];
    }
    return teams;
}

export function sortTeamsWithLocale(locale: string): (a: Team, b: Team) => number {
    return (a: Team, b: Team): number => {
        if (a.display_name !== b.display_name) {
            return a.display_name.toLowerCase().localeCompare(b.display_name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
        }

        return a.name.toLowerCase().localeCompare(b.name.toLowerCase(), locale || General.DEFAULT_LOCALE, {numeric: true});
    };
}
