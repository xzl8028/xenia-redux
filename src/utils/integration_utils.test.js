// Copyright (c) 2015-present Xenia, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import assert from 'assert';
import {checkDialogElementForError, checkIfErrorsMatchElements} from 'utils/integration_utils';

describe('integration utils', () => {
    describe('checkDialogElementForError', () => {
        it('should return null error on optional text element', () => {
            assert.equal(checkDialogElementForError({type: 'text', optional: true}), null);
        });

        it('should return null error on optional textarea element', () => {
            assert.equal(checkDialogElementForError({type: 'textarea', optional: true}), null);
        });

        it('should return error on required element', () => {
            assert.equal(checkDialogElementForError({type: 'text', optional: false}).id, 'interactive_dialog.error.required');
        });

        it('should return error on too short text element', () => {
            assert.equal(checkDialogElementForError({type: 'text', min_length: 5}, '123').id, 'interactive_dialog.error.too_short');
        });

        it('should return null on good number element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'number'}, '123'), null);
        });

        it('should return error on bad number element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'number'}, 'totallyanumber').id, 'interactive_dialog.error.bad_number');
        });

        it('should return null on good email element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'email'}, 'joram@xenia.com'), null);
        });

        it('should return error on bad email element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'email'}, 'totallyanemail').id, 'interactive_dialog.error.bad_email');
        });

        it('should return null on good url element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'url'}, 'http://xenia.com'), null);
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'url'}, 'https://xenia.com'), null);
        });

        it('should return error on bad url element', () => {
            assert.equal(checkDialogElementForError({type: 'text', subtype: 'url'}, 'totallyawebsite').id, 'interactive_dialog.error.bad_url');
        });
    });

    describe('checkIfErrorsMatchElements', () => {
        it('should pass as returned error matches an element', () => {
            assert.ok(checkIfErrorsMatchElements({name1: 'some error'}, [{name: 'name1'}]));
            assert.ok(checkIfErrorsMatchElements({name1: 'some error'}, [{name: 'name1'}, {name: 'name2'}]));
        });

        it('should fail as returned errors do not match an element', () => {
            assert.ok(!checkIfErrorsMatchElements({name17: 'some error'}, [{name: 'name1'}, {name: 'name2'}]));
        });
    });
});
