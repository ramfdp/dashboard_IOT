/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Bookmark":"Könyvjelző","Insert":"Beszúrás","Update":"Frissítés","Edit bookmark":"Könyvjelző szerkesztése","Remove bookmark":"Könyvjelző törlése","Bookmark name":"Könyvjelző neve","Enter the bookmark name without spaces.":"Írja be a könyvjelző nevét szóközök nélkül.","Bookmark must not be empty.":"A könyvjelző nem lehet üres.","Bookmark name cannot contain space characters.":"A könyvjelző neve nem tartalmazhat szóköz karaktereket.","Bookmark name already exists.":"A könyvjelzőnév már létezik.","bookmark widget":"könyvjelző widget"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
