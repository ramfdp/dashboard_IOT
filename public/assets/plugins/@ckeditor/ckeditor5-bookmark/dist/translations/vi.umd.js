/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

( e => {
const { [ 'vi' ]: { dictionary, getPluralForm } } = {"vi":{"dictionary":{"Bookmark":"Dấu trang","Insert":"Chèn","Update":"Cập nhật","Edit bookmark":"Chỉnh sửa dấu trang","Remove bookmark":"Xóa dấu trang","Bookmark name":"Tên dấu trang","Enter the bookmark name without spaces.":"Nhập tên dấu trang không có khoảng trắng.","Bookmark must not be empty.":"Dấu trang không được để trống.","Bookmark name cannot contain space characters.":"Tên dấu trang không được chứa ký tự khoảng trắng.","Bookmark name already exists.":"Tên dấu trang đã tồn tại.","bookmark widget":"tiện ích đánh dấu trang"},getPluralForm(n){return 0;}}};
e[ 'vi' ] ||= { dictionary: {}, getPluralForm: null };
e[ 'vi' ].dictionary = Object.assign( e[ 'vi' ].dictionary, dictionary );
e[ 'vi' ].getPluralForm = getPluralForm;
} )( window.CKEDITOR_TRANSLATIONS ||= {} );
