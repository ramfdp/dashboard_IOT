/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'cs' ]: { dictionary, getPluralForm } } = {"cs":{"dictionary":{"Unlink":"Odstranit odkaz","Link":"Odkaz","Link URL":"URL odkazu","Link URL must not be empty.":"Adresa URL odkazu nesmí být prázdná.","Link image":"Adresa obrázku","Edit link":"Upravit odkaz","Open link in new tab":"Otevřít odkaz v nové kartě","This link has no URL":"Tento odkaz nemá žádnou URL","Open in a new tab":"Otevřít v nové kartě","Downloadable":"Ke stažení","Create link":"Vytvořit odkaz","Move out of a link":"Odejít z odkazu","Scroll to target":"Přejít na cíl"},getPluralForm(n){return (n == 1 ? 0 : (n >= 2 && n <= 4) ? 1 : 2);}}};
e[ 'cs' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'cs' ].dictionary = Object.assign( e[ 'cs' ].dictionary, dictionary );
e[ 'cs' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
