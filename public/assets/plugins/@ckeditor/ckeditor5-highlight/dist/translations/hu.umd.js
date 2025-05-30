/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'hu' ]: { dictionary, getPluralForm } } = {"hu":{"dictionary":{"Yellow marker":"Sárga kiemelő","Green marker":"Zöld kiemelő","Pink marker":"Rózsaszín kiemelő","Blue marker":"Kék kiemelő","Red pen":"Piros toll","Green pen":"Zöld toll","Remove highlight":"Kiemelés eltávolítása","Highlight":"Kiemelés","Text highlight toolbar":"Szöveg kiemelés eszköztár"},getPluralForm(n){return (n != 1);}}};
e[ 'hu' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'hu' ].dictionary = Object.assign( e[ 'hu' ].dictionary, dictionary );
e[ 'hu' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
