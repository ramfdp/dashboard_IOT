/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"media widget":"медіа віджет","Media URL":"Медіа URL","Paste the media URL in the input.":"Вставте URL на медіа в інпут.","Tip: Paste the URL into the content to embed faster.":"Вставте URL у вміст для швидкого перекладу.","The URL must not be empty.":"URL не повинен бути порожнім.","This media URL is not supported.":"Даний медіа URL не підтримується.","Insert media":"Вставити медіа","Media":"Медіа","Media toolbar":"Панель інструментів медіа","Open media in new tab":"Відкрити медіа у новій вкладці"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
