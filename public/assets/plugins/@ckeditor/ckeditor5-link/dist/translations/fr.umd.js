/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'fr' ]: { dictionary, getPluralForm } } = {"fr":{"dictionary":{"Unlink":"Supprimer le lien","Link":"Lien","Link URL":"URL du lien","Link URL must not be empty.":"L'URL du lien ne doit pas être vide.","Link image":"Lien d'image","Edit link":"Modifier le lien","Open link in new tab":"Ouvrir le lien dans un nouvel onglet","This link has no URL":"Ce lien n'a pas d'URL","Open in a new tab":"Ouvrir dans un nouvel onglet","Downloadable":"Fichier téléchargeable","Create link":"Créer un lien","Move out of a link":"Sortir d'un lien","Scroll to target":"Faire défiler jusqu'à la cible"},getPluralForm(n){return (n <= -2 || n >= 2);}}};
e[ 'fr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'fr' ].dictionary = Object.assign( e[ 'fr' ].dictionary, dictionary );
e[ 'fr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
