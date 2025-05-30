/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'et' ]: { dictionary, getPluralForm } } = {"et":{"dictionary":{"Bookmark":"Järjehoidja","Insert":"Sisesta","Update":"Uuenda","Edit bookmark":"Muuda järjehoidjat","Remove bookmark":"Eemalda järjehoidja","Bookmark name":"Järjehoidja nimi","Enter the bookmark name without spaces.":"Sisestage järjehoidja nimi ilma tühikuteta.","Bookmark must not be empty.":"Järjehoidja väli ei tohi olla tühi.","Bookmark name cannot contain space characters.":"Järjehoidja nimi ei tohi sisaldada tühikuid.","Bookmark name already exists.":"Järjehoidja nimi on juba olemas.","bookmark widget":"järjehoidja vidin"},getPluralForm(n){return (n != 1);}}};
e[ 'et' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'et' ].dictionary = Object.assign( e[ 'et' ].dictionary, dictionary );
e[ 'et' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
