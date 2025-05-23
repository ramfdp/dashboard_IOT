/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Emoji":"Emoji","Show all emoji...":"Tunjukkan semua emoji...","Find an emoji (min. 2 characters)":"Cari emoji (min. 2 aksara)","No emojis were found matching \"%0\".":"Tiada emoji ditemui yang sepadan dengan \"%0\".","Keep on typing to see the emoji.":"Teruskan menaip untuk melihat emoji.","The query must contain at least two characters.":"Pertanyaan mesti mengandungi sekurang-kurangnya dua aksara.","Smileys & Expressions":"Wajah tersenyum & Ekspresi","Gestures & People":"Gerak isyarat & Orang","Animals & Nature":"Haiwan & Alam Semula Jadi","Food & Drinks":"Makanan & Minuman","Travel & Places":"Perjalanan & Tempat","Activities":"Aktiviti","Objects":"Objek","Symbols":"Simbol","Flags":"Bendera","Select skin tone":"Pilih tona kulit","Default skin tone":"Tona kulit lalai","Light skin tone":"Tona kulit cerah","Medium Light skin tone":"Tona kulit Sederhana Cerah","Medium skin tone":"Tona kulit sederhana","Medium Dark skin tone":"Tona kulit Sederhana Gelap","Dark skin tone":"Tona kulit gelap"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
