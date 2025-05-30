/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Bookmark":"Yer imi","Insert":"Ekle","Update":"Güncelle","Edit bookmark":"Yer imini düzenle","Remove bookmark":"Yer imini kaldır","Bookmark name":"Yer imi adı","Enter the bookmark name without spaces.":"Yer imi adını boşluk bırakmadan gir.","Bookmark must not be empty.":"Yer imi boş bırakılamaz.","Bookmark name cannot contain space characters.":"Yer imi adı, boşluk karakterleri içeremez.","Bookmark name already exists.":"Yer imi adı zaten var.","bookmark widget":"yer imi araç takımı"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
