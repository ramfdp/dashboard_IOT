/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'id' ]: { dictionary, getPluralForm } } = {"id":{"dictionary":{"Numbered List":"Daftar Berangka","Bulleted List":"Daftar Tak Berangka","To-do List":"Daftar untuk-dikerjakan","Bulleted list styles toolbar":"Bilah alat gaya daftar bullet","Numbered list styles toolbar":"Bilah alat gaya daftar angka","Toggle the disc list style":"Alihkan gaya daftar disc","Toggle the circle list style":"Alihkan gaya daftar circle","Toggle the square list style":"Alihkan gaya daftar square","Toggle the decimal list style":"Alihkan gaya daftar decimal","Toggle the decimal with leading zero list style":"Alihkan gaya daftar decimal with leading zero","Toggle the lower–roman list style":"Alihkan gaya daftar lower–roman","Toggle the upper–roman list style":"Alihkan gaya daftar upper–roman","Toggle the lower–latin list style":"Alihkan gaya daftar lower–latin","Toggle the upper–latin list style":"Alihkan gaya daftar upper–latin","Disc":"Disk","Circle":"Lingkaran","Square":"Kotak","Decimal":"Desimal","Decimal with leading zero":"Desimal dengan awalan nol","Lower–roman":"Lower–roman","Upper-roman":"Upper-roman","Lower-latin":"Lower-latin","Upper-latin":"Upper-latin","List properties":"Properti daftar","Start at":"Mulai dari","Invalid start index value.":"Nilai indeks mulai tidak valid.","Start index must be greater than 0.":"Indeks awal harus lebih besar dari 0.","Reversed order":"Urutan terbalik","Keystrokes that can be used in a list":"Penekanan tombol yang dapat digunakan di daftar","Increase list item indent":"Tambah indentasi item daftar","Decrease list item indent":"Kurangi indentasi item daftar","Entering a to-do list":"memasukkan daftar kerja","Leaving a to-do list":"meninggalkan daftar kerja"},getPluralForm(n){return 0;}}};
e[ 'id' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'id' ].dictionary = Object.assign( e[ 'id' ].dictionary, dictionary );
e[ 'id' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
