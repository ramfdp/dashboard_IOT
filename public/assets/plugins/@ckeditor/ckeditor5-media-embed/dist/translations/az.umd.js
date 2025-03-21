/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'az' ]: { dictionary, getPluralForm } } = {"az":{"dictionary":{"media widget":"media vidgeti","Media URL":"Media URL","Paste the media URL in the input.":"Media URL-ni xanaya əlavə edin","Tip: Paste the URL into the content to embed faster.":"Məsləhət: Sürətli qoşma üçün URL-i kontentə əlavə edin","The URL must not be empty.":"URL boş olmamalıdır.","This media URL is not supported.":"Bu media URL dəstəklənmir.","Insert media":"Media əlavə ed","Media":"","Media toolbar":"Media paneli","Open media in new tab":""},getPluralForm(n){return (n != 1);}}};
e[ 'az' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'az' ].dictionary = Object.assign( e[ 'az' ].dictionary, dictionary );
e[ 'az' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
