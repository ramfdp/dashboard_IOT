/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ru' ]: { dictionary, getPluralForm } } = {"ru":{"dictionary":{"Open file manager":"Открыть менеджер файлов","Cannot determine a category for the uploaded file.":"Не удаётся определить категорию для загруженного файла.","Cannot access default workspace.":"Не удается получить доступ к рабочему пространству по умолчанию.","You have no image editing permissions.":"У вас нет разрешений на редактирование изображений.","Edit image":"Редактировать изображение","Processing the edited image.":"Обработка отредактированного изображения.","Server failed to process the image.":"Серверу не удалось обработать изображение.","Failed to determine category of edited image.":"Не удалось определить категорию отредактированного изображения."},getPluralForm(n){return (n % 10 == 1 && n % 100 != 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2);}}};
e[ 'ru' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ru' ].dictionary = Object.assign( e[ 'ru' ].dictionary, dictionary );
e[ 'ru' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
