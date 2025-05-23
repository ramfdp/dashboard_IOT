/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'ko' ]: { dictionary, getPluralForm } } = {"ko":{"dictionary":{"Emoji":"이모지","Show all emoji...":"모든 이모지 표시...","Find an emoji (min. 2 characters)":"이모지 찾기(최소 2자)","No emojis were found matching \"%0\".":"\"%0\"에 대한 이모지를 찾을 수 없습니다.","Keep on typing to see the emoji.":"이모지를 보려면 계속 입력하세요.","The query must contain at least two characters.":"쿼리에는 2자 이상이 포함되어야 합니다.","Smileys & Expressions":"스마일 및 표정","Gestures & People":"제스처 및 사람","Animals & Nature":"동물 및 자연","Food & Drinks":"음식 및 음료","Travel & Places":"여행 및 장소","Activities":"활동","Objects":"사물","Symbols":"기호","Flags":"깃발","Select skin tone":"피부색 선택","Default skin tone":"기본 피부색","Light skin tone":"밝은 피부색","Medium Light skin tone":"약간 밝은 피부색","Medium skin tone":"중간 피부색","Medium Dark skin tone":"약간 어두운 피부색","Dark skin tone":"어두운 피부색"},getPluralForm(n){return 0;}}};
e[ 'ko' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'ko' ].dictionary = Object.assign( e[ 'ko' ].dictionary, dictionary );
e[ 'ko' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
