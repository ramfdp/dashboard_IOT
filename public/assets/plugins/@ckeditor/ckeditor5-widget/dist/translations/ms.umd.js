/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ms' ]: { dictionary, getPluralForm } } = {"ms":{"dictionary":{"Widget toolbar":"Bar alat capaian widget","Insert paragraph before block":"Masukkan perenggan sebelum blok","Insert paragraph after block":"Masukkan perenggan sebelum blok","Press Enter to type after or press Shift + Enter to type before the widget":"Tekan Enter untuk menaip selepas atau tekan Shift + Enter untuk menaip sebelum widget","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"Ketukan kekunci yang boleh digunakan semasa widget dipilih (contohnya: imej, jadual, dsb.)","Insert a new paragraph directly after a widget":"Masukkan perenggan baharu secara langsung selepas widget","Insert a new paragraph directly before a widget":"Masukkan perenggan baharu secara langsung sebelum widget","Move the caret to allow typing directly before a widget":"Alihkan karet untuk membenarkan penaipan secara langsung sebelum widget","Move the caret to allow typing directly after a widget":"Alihkan karet untuk membenarkan penaipan secara langsung selepas widget","Move focus from an editable area back to the parent widget":"Alihkan fokus dari kawasan yang boleh diedit kembali ke widget induk"},getPluralForm(n){return 0;}}};
e[ 'ms' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ms' ].dictionary = Object.assign( e[ 'ms' ].dictionary, dictionary );
e[ 'ms' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
