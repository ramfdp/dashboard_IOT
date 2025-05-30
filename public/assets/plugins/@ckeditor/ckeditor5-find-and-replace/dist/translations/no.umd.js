/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'no' ]: { dictionary, getPluralForm } } = {"no":{"dictionary":{"Find and replace":"Søk og erstatt","Find in text…":"Søk i tekst","Find":"Søk","Previous result":"Forrige resultat","Next result":"Neste resultat","Replace":"Erstatt","Replace all":"Erstatt alt","Match case":"Skill mellom store og små bokstaver","Whole words only":"Kun hele ord","Replace with…":"Erstatt med …","Text to find must not be empty.":"Teksten som skal finnes må ikke være tom","Tip: Find some text first in order to replace it.":"Tips: Finn noe tekst først for å kunne erstatte den.","Advanced options":"Avanserte alternativer","Find in the document":"Finn i dokumentet"},getPluralForm(n){return (n != 1);}}};
e[ 'no' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'no' ].dictionary = Object.assign( e[ 'no' ].dictionary, dictionary );
e[ 'no' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
