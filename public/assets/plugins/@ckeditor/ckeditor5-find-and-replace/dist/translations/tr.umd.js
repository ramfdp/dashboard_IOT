/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'tr' ]: { dictionary, getPluralForm } } = {"tr":{"dictionary":{"Find and replace":"Bul ve değiştir","Find in text…":"Metinde bul...","Find":"Bul","Previous result":"Önceki sonuç","Next result":"Sonraki sonuç","Replace":"Değiştir","Replace all":"Hepsini değiştir","Match case":"Büyük küçük harfe duyarlı","Whole words only":"Sadece bütün kelimeler","Replace with…":"Şununla değiştir...","Text to find must not be empty.":"Bulunacak metin boş bırakılmamalıdır.","Tip: Find some text first in order to replace it.":"İpucu: Değiştirmek için önce bir metin bul.","Advanced options":"Gelişmiş seçenekler","Find in the document":"Belgede bul"},getPluralForm(n){return (n > 1);}}};
e[ 'tr' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'tr' ].dictionary = Object.assign( e[ 'tr' ].dictionary, dictionary );
e[ 'tr' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
