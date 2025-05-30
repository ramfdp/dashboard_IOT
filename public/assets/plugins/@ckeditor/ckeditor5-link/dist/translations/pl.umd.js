/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'pl' ]: { dictionary, getPluralForm } } = {"pl":{"dictionary":{"Unlink":"Usuń odnośnik","Link":"Wstaw odnośnik","Link URL":"Adres URL","Link URL must not be empty.":"Adres URL linku nie może być pusty","Link image":"Wstaw odnośnik do obrazka","Edit link":"Edytuj odnośnik","Open link in new tab":"Otwórz odnośnik w nowej zakładce","This link has no URL":"Nie podano adresu URL odnośnika","Open in a new tab":"Otwórz w nowej zakładce","Downloadable":"Do pobrania","Create link":"Tworzy link","Move out of a link":"Umożliwia wyjście z linku","Scroll to target":"Przewiń do celu"},getPluralForm(n){return (n == 1 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'pl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'pl' ].dictionary = Object.assign( e[ 'pl' ].dictionary, dictionary );
e[ 'pl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
