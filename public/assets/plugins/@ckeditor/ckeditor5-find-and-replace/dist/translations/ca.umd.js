/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ca' ]: { dictionary, getPluralForm } } = {"ca":{"dictionary":{"Find and replace":"Trobar i substituir","Find in text…":"Trobar al text...","Find":"Trobar","Previous result":"Resultat anterior","Next result":"Següent resultat","Replace":"Substituir","Replace all":"Substituir-ho tot","Match case":"Coincidència de majúscules i minúscules","Whole words only":"Només paraules senceres","Replace with…":"Substituir per...","Text to find must not be empty.":"El text per cercar no pot estar buit.","Tip: Find some text first in order to replace it.":"Consell: Troba primer un text per substituir-lo.","Advanced options":"Opcions avançades","Find in the document":"Busca en el document"},getPluralForm(n){return (n != 1);}}};
e[ 'ca' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ca' ].dictionary = Object.assign( e[ 'ca' ].dictionary, dictionary );
e[ 'ca' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
