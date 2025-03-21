/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'uk' ]: { dictionary, getPluralForm } } = {"uk":{"dictionary":{"Bookmark":"Закладка","Insert":"Вставити","Update":"Оновити","Edit bookmark":"Редагувати закладку","Remove bookmark":"Видалити закладку","Bookmark name":"Назва закладки","Enter the bookmark name without spaces.":"Введіть назву закладки без пробілів.","Bookmark must not be empty.":"Закладка не може бути порожньою.","Bookmark name cannot contain space characters.":"Назва закладки не може містити пробілів.","Bookmark name already exists.":"Назва закладки вже існує.","bookmark widget":"віджет закладок"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'uk' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'uk' ].dictionary = Object.assign( e[ 'uk' ].dictionary, dictionary );
e[ 'uk' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
