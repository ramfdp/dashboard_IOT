/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Bookmark":"Penanda","Insert":"Sisipkan","Update":"PErbarui","Edit bookmark":"Edit penanda","Remove bookmark":"Hapus penanda","Bookmark name":"Nama penanda","Enter the bookmark name without spaces.":"Masukkan nama penanda tanpa spasi.","Bookmark must not be empty.":"Penanda tidak boleh kosong.","Bookmark name cannot contain space characters.":"Nama penanda tidak boleh mengandung spasi.","Bookmark name already exists.":"Nama penanda sudah ada.","bookmark widget":"widget penanda"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
