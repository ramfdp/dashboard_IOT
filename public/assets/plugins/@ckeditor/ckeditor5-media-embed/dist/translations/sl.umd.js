/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'sl' ]: { dictionary, getPluralForm } } = {"sl":{"dictionary":{"media widget":"","Media URL":"","Paste the media URL in the input.":"","Tip: Paste the URL into the content to embed faster.":"","The URL must not be empty.":"","This media URL is not supported.":"","Insert media":"","Media":"","Media toolbar":"","Open media in new tab":""},getPluralForm(n){return (n % 100 == 1 ? 1 : n % 100 == 2 ? 2 : n % 100 == 3 || n % 100 == 4 ? 3 : 0);}}};
e[ 'sl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'sl' ].dictionary = Object.assign( e[ 'sl' ].dictionary, dictionary );
e[ 'sl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
