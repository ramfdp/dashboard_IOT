/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'lv' ]: { dictionary, getPluralForm } } = {"lv":{"dictionary":{"Find and replace":"Meklēt un aizstāt","Find in text…":"Meklēt tekstā...","Find":"Meklēt","Previous result":"Iepriekšējais rezultāts","Next result":"Nākamais rezultāts","Replace":"Aizstāt","Replace all":"Aizstāt visu","Match case":"Precīza atbilstība","Whole words only":"Tikai pilni vārdi","Replace with…":"Aizstāt ar...","Text to find must not be empty.":"Meklēšanas tekstam jābūt aizpildītam.","Tip: Find some text first in order to replace it.":"Padoms: Sākumā uzmeklējiet tekstu un tikai tad aizstājiet to.","Advanced options":"Uzlabotas iespējas","Find in the document":"Meklēt dokumentā"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n != 0 ? 1 : 2);}}};
e[ 'lv' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'lv' ].dictionary = Object.assign( e[ 'lv' ].dictionary, dictionary );
e[ 'lv' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
