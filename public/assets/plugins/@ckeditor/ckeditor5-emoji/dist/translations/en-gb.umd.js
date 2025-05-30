/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'en-gb' ]: { dictionary, getPluralForm } } = {"en-gb":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Show all emoji...","Find an emoji (min. 2 characters)":"Find an emoji (min. 2 characters)","No emojis were found matching \"%0\".":"No emojis were found matching \"%0\".","Keep on typing to see the emoji.":"Keep on typing to see the emoji.","The query must contain at least two characters.":"The query must contain at least two characters.","Smileys & Expressions":"Smileys & Expressions","Gestures & People":"Gestures & People","Animals & Nature":"Animals & Nature","Food & Drinks":"Food & Drinks","Travel & Places":"Travel & Places","Activities":"Activities","Objects":"Objects","Symbols":"Symbols","Flags":"Flags","Select skin tone":"Select skin tone","Default skin tone":"Default skin tone","Light skin tone":"Light skin tone","Medium Light skin tone":"Medium Light skin tone","Medium skin tone":"Medium skin tone","Medium Dark skin tone":"Medium Dark skin tone","Dark skin tone":"Dark skin tone"},getPluralForm(n){return (n != 1);}}};
e[ 'en-gb' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'en-gb' ].dictionary = Object.assign( e[ 'en-gb' ].dictionary, dictionary );
e[ 'en-gb' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
