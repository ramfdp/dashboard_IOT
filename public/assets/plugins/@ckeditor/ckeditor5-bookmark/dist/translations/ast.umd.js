/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ast' ]: { dictionary, getPluralForm } } = {"ast":{"dictionary":{"Bookmark":"","Insert":"","Update":"","Edit bookmark":"","Remove bookmark":"","Bookmark name":"","Enter the bookmark name without spaces.":"","Bookmark must not be empty.":"","Bookmark name cannot contain space characters.":"","Bookmark name already exists.":"","bookmark widget":""},getPluralForm(n){return (n != 1);}}};
e[ 'ast' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ast' ].dictionary = Object.assign( e[ 'ast' ].dictionary, dictionary );
e[ 'ast' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
