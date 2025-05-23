/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ar' ]: { dictionary, getPluralForm } } = {"ar":{"dictionary":{"Unlink":"إلغاء الرابط","Link":"رابط","Link URL":"رابط عنوان","Link URL must not be empty.":"يجب ألا يكون عنوان الرابط فارغاً.","Link image":"ربط الصورة","Edit link":"تحرير الرابط","Open link in new tab":"فتح الرابط في تبويب جديد","This link has no URL":"لا يحتوي هذا الرابط على عنوان","Open in a new tab":"فتح في تبويب جديد","Downloadable":"يمكن تنزيله","Create link":"قمْ بإنشاء رابط","Move out of a link":"ابتعدْ عن الرابط","Scroll to target":"انتقل إلى الهدف"},getPluralForm(n){return (n == 0 ? 0 : n == 1 ? 1 : n == 2 ? 2 : n % 100 >= 3 && n % 100 <= 10 ? 3 : n % 100 >= 11 ? 4 : 5);}}};
e[ 'ar' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ar' ].dictionary = Object.assign( e[ 'ar' ].dictionary, dictionary );
e[ 'ar' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
