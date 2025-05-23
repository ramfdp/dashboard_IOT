/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Emoji":"Эмодзи","Show all emoji...":"Показать все эмодзи...","Find an emoji (min. 2 characters)":"Найти эмодзи (мин. 2 символа)","No emojis were found matching \"%0\".":"Не найдено ни одного эмодзи, соответствующего \"%0\".","Keep on typing to see the emoji.":"Продолжайте набирать текст, чтобы увидеть эмодзи.","The query must contain at least two characters.":"Запрос должен содержать не менее двух символов.","Smileys & Expressions":"Смайлы и эмоции","Gestures & People":"Жесты и люди","Animals & Nature":"Животные и природа","Food & Drinks":"Еда и напитки","Travel & Places":"Путешествия и достопримечательности","Activities":"Развлечения","Objects":"Объекты","Symbols":"Символы","Flags":"Флаги","Select skin tone":"Выберите цвет кожи","Default skin tone":"Цвет кожи по умолчанию","Light skin tone":"Светлый оттенок кожи","Medium Light skin tone":"Средне-светлый оттенок кожи","Medium skin tone":"Средний оттенок кожи","Medium Dark skin tone":"Средне-темный оттенок кожи","Dark skin tone":"Темный оттенок кожи"},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
