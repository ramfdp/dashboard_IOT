/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'de' ]: { dictionary, getPluralForm } } = {"de":{"dictionary":{"media widget":"Medien-Widget","Media URL":"Medien-URL","Paste the media URL in the input.":"Medien-URL in das Eingabefeld einfügen.","Tip: Paste the URL into the content to embed faster.":"Tipp: Zum schnelleren Einbetten können Sie die Medien-URL in den Inhalt einfügen.","The URL must not be empty.":"Die URL darf nicht leer sein.","This media URL is not supported.":"Diese Medien-URL wird nicht unterstützt.","Insert media":"Medium einfügen","Media":"Medien","Media toolbar":"Medien Werkzeugleiste","Open media in new tab":"Medien in neuem Tab öffnen"},getPluralForm(n){return (n != 1);}}};
e[ 'de' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'de' ].dictionary = Object.assign( e[ 'de' ].dictionary, dictionary );
e[ 'de' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
