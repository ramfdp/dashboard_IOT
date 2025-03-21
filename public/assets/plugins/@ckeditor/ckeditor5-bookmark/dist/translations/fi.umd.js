/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Bookmark":"Kirjanmerkki","Insert":"Liitä","Update":"Päivitä","Edit bookmark":"Muokkaa kirjanmerkkiä","Remove bookmark":"Poista kirjanmerkki","Bookmark name":"Kirjanmerkin nimi","Enter the bookmark name without spaces.":"Lisää kirjanmerkin nimi ilman välilyöntejä","Bookmark must not be empty.":"Kirjanmerkkiä ei saa jättää tyhjäksi.","Bookmark name cannot contain space characters.":"Kirjanmerkin nimessä ei saa olla välilyöntejä.","Bookmark name already exists.":"Kirjanmerkin nimi on jo käytössä.","bookmark widget":"kirjanmerkkien pienoisohjelma"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
