/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Bookmark":"書籤","Insert":"插入","Update":"更新","Edit bookmark":"編輯書籤","Remove bookmark":"移除書籤","Bookmark name":"書籤名稱","Enter the bookmark name without spaces.":"輸入書籤名稱，請勿包含空格。","Bookmark must not be empty.":"書籤名稱不得為空。","Bookmark name cannot contain space characters.":"書籤名稱不可包含空格字元。","Bookmark name already exists.":"書籤名稱已存在。","bookmark widget":"書籤小工具"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
