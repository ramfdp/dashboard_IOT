/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'el' ]: { dictionary, getPluralForm } } = {"el":{"dictionary":{"Unlink":"Αφαίρεση συνδέσμου","Link":"Σύνδεσμος","Link URL":"Διεύθυνση συνδέσμου","Link URL must not be empty.":"Η διεύθυνση URL του συνδέσμου δεν πρέπει να είναι κενή.","Link image":"Εικόνα συνδέσμου","Edit link":"Επεξεργασία συνδέσμου","Open link in new tab":"Άνοιγμα συνδέσμου σε νέα καρτέλα","This link has no URL":"Ο σύνδεσμος δεν έχει διεύθυνση","Open in a new tab":"Άνοιγμα σε νέα καρτέλα","Downloadable":"Με δυνατότητα λήψης","Create link":"Δημιουργία συνδέσμου","Move out of a link":"Μετακίνηση από έναν σύνδεσμο","Scroll to target":"Κάντε κύλιση στον στόχο"},getPluralForm(n){return (n != 1);}}};
e[ 'el' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'el' ].dictionary = Object.assign( e[ 'el' ].dictionary, dictionary );
e[ 'el' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
