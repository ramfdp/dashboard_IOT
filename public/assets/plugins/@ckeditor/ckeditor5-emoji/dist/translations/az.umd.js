/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"Emoji":"","Show all emoji...":"","Find an emoji (min. 2 characters)":"","No emojis were found matching \"%0\".":"","Keep on typing to see the emoji.":"","The query must contain at least two characters.":"","Smileys & Expressions":"","Gestures & People":"","Animals & Nature":"","Food & Drinks":"","Travel & Places":"","Activities":"","Objects":"","Symbols":"","Flags":"","Select skin tone":"","Default skin tone":"","Light skin tone":"","Medium Light skin tone":"","Medium skin tone":"","Medium Dark skin tone":"","Dark skin tone":""},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
