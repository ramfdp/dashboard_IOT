/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fi' ]: { dictionary, getPluralForm } } = {"fi":{"dictionary":{"Widget toolbar":"Widget-työkalupalkki","Insert paragraph before block":"Liitä kappale ennen lohkoa","Insert paragraph after block":"Liitä kappale lohkon jälkeen","Press Enter to type after or press Shift + Enter to type before the widget":"Paina enter-näppäintä kirjoittaaksesi tai paina shift + enter kirjoittaaksesi ennen widget-sovellusta","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Painallukset, joita voidaan käyttää widgetin valitsemisen yhteydessä (esimerkiksi: kuva, taulukko jne.)","Insert a new paragraph directly after a widget":"Lisää uusi kappale suoraan widgetin jälkeen","Insert a new paragraph directly before a widget":"Lisää uusi kappale suoraan widgetin eteen","Move the caret to allow typing directly before a widget":"Siirrä sirkumfleksimerkkiä voidaksesi kirjoittaa suoraan ennen widgetiä","Move the caret to allow typing directly after a widget":"Siirrä sirkumfleksimerkkiä voidaksesi kirjoittaa suoraan widgetin jälkeen","Move focus from an editable area back to the parent widget":"Siirrä valinta muokattavasta alueesta takaisin pääpienoissovellukseen"},getPluralForm(n){return (n != 1);}}};
e[ 'fi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fi' ].dictionary = Object.assign( e[ 'fi' ].dictionary, dictionary );
e[ 'fi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
