/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'nl' ]: { dictionary, getPluralForm } } = {"nl":{"dictionary":{"media widget":"media widget","Media URL":"Media URL","Paste the media URL in the input.":"Plak de media URL in het invoerveld.","Tip: Paste the URL into the content to embed faster.":"Tip: plak de URL in de inhoud om deze sneller in te laten sluiten.","The URL must not be empty.":"De URL mag niet leeg zijn.","This media URL is not supported.":"Deze media URL wordt niet ondersteund.","Insert media":"Voer media in","Media":"Media","Media toolbar":"Media werkbalk","Open media in new tab":"Open media in nieuw tabblad"},getPluralForm(n){return (n != 1);}}};
e[ 'nl' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'nl' ].dictionary = Object.assign( e[ 'nl' ].dictionary, dictionary );
e[ 'nl' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
