/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imageinsert
 */
import { Plugin } from 'ckeditor5/src/core.js';
import ImageUpload from './imageupload.js';
import ImageInsertViaUrl from './imageinsertviaurl.js';
import ImageInsertUI from './imageinsert/imageinsertui.js';
/**
 * The image insert plugin.
 *
 * For a detailed overview, check the {@glink features/images/image-upload/image-upload Image upload feature}
 * and {@glink features/images/images-inserting Insert images via source URL} documentation.
 *
 * This plugin does not do anything directly, but it loads a set of specific plugins
 * to enable image uploading or inserting via implemented integrations:
 *
 * * {@link module:image/imageupload~ImageUpload}
 * * {@link module:image/imageinsert/imageinsertui~ImageInsertUI}
 */
export default class ImageInsert extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageInsert";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageUpload, typeof ImageInsertViaUrl, typeof ImageInsertUI];
}
