/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'zh' ]: { dictionary, getPluralForm } } = {"zh":{"dictionary":{"Emoji":"表情符號","Show all emoji...":"顯示所有表情符號…","Find an emoji (min. 2 characters)":"尋找表情符號（最少 2 個字元）","No emojis were found matching \"%0\".":"找不到與「%0」相符的表情符號。","Keep on typing to see the emoji.":"繼續輸入以查看表情符號。","The query must contain at least two characters.":"查詢條件至少須包含兩個字元。","Smileys & Expressions":"笑臉與表情","Gestures & People":"手勢與人物","Animals & Nature":"動物與自然","Food & Drinks":"飲食","Travel & Places":"旅遊與景點","Activities":"活動","Objects":"物件","Symbols":"符號","Flags":"旗幟","Select skin tone":"選取膚色","Default skin tone":"預設膚色","Light skin tone":"淺調膚色","Medium Light skin tone":"中淺調膚色","Medium skin tone":"中調膚色","Medium Dark skin tone":"中深調膚色","Dark skin tone":"深調膚色"},getPluralForm(n){return 0;}}};
e[ 'zh' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'zh' ].dictionary = Object.assign( e[ 'zh' ].dictionary, dictionary );
e[ 'zh' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
