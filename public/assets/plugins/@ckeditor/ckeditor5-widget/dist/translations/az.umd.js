/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Widget toolbar":"Vidgetin paneli","Insert paragraph before block":"","Insert paragraph after block":"","Press Enter to type after or press Shift + Enter to type before the widget":"","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"","Insert a new paragraph directly after a widget":"","Insert a new paragraph directly before a widget":"","Move the caret to allow typing directly before a widget":"","Move the caret to allow typing directly after a widget":"","Move focus from an editable area back to the parent widget":""},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
