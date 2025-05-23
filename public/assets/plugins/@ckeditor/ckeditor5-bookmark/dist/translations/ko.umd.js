/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Bookmark":"책갈피","Insert":"삽입","Update":"업데이트","Edit bookmark":"책갈피 편집","Remove bookmark":"책갈피 제거","Bookmark name":"책갈피 이름","Enter the bookmark name without spaces.":"공백 없이 책갈피 이름을 입력하세요.","Bookmark must not be empty.":"책갈피 이름은 비워 둘 수 없습니다.","Bookmark name cannot contain space characters.":"책갈피 이름에는 공백이 포함될 수 없습니다.","Bookmark name already exists.":"책갈피 이름이 이미 존재합니다.","bookmark widget":"책갈피 위젯"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
