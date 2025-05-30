/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Widget toolbar":"위젯 툴바","Insert paragraph before block":"블록 앞에 단락 삽입","Insert paragraph after block":"블록 뒤에 단락 삽입","Press Enter to type after or press Shift + Enter to type before the widget":"엔터를 눌러서 위젯 뒤에 입력하거나 시프트 + 엔터를 눌러서 위젯 앞에 입력하세요","Keystrokes that can be used when a widget is selected (for example: image, table, etc.)":"위젯이 선택되었을 때 사용할 수 있는 키 입력(예: 이미지, 표 등)","Insert a new paragraph directly after a widget":"위젯 바로 뒤에 새 단락 삽입","Insert a new paragraph directly before a widget":"위젯 바로 앞에 새 단락 삽입","Move the caret to allow typing directly before a widget":"위젯 바로 앞에 입력할 수 있도록 삽입 기호 이동","Move the caret to allow typing directly after a widget":"위젯 바로 뒤에 입력할 수 있도록 삽입 기호 이동","Move focus from an editable area back to the parent widget":"포커스를 편집 가능 영역에서 부모위젯으로 옮기기"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
