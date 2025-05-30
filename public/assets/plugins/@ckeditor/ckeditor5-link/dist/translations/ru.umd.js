/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Unlink":"Убрать ссылку","Link":"Ссылка","Link URL":"Ссылка URL","Link URL must not be empty.":"URL-адрес ссылки не должен быть пустым.","Link image":"Ссылка на изображение","Edit link":"Редактировать ссылку","Open link in new tab":"Открыть ссылку в новой вкладке","This link has no URL":"Для этой ссылки не установлен адрес URL","Open in a new tab":"Открыть в новой вкладке","Downloadable":"Загружаемые","Create link":"Создать ссылку","Move out of a link":"Выйти из ссылки","Scroll to target":"Прокрутите до цели"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
