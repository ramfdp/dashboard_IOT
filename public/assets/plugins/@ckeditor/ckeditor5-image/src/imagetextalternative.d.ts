/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module image/imagetextalternative
 */
import { Plugin } from 'ckeditor5/src/core.js';
import ImageTextAlternativeEditing from './imagetextalternative/imagetextalternativeediting.js';
import ImageTextAlternativeUI from './imagetextalternative/imagetextalternativeui.js';
/**
 * The image text alternative plugin.
 *
 * For a detailed overview, check the {@glink features/images/images-styles image styles} documentation.
 *
 * This is a "glue" plugin which loads the
 *  {@link module:image/imagetextalternative/imagetextalternativeediting~ImageTextAlternativeEditing}
 * and {@link module:image/imagetextalternative/imagetextalternativeui~ImageTextAlternativeUI} plugins.
 */
export default class ImageTextAlternative extends Plugin {
    /**
     * @inheritDoc
     */
    static get requires(): readonly [typeof ImageTextAlternativeEditing, typeof ImageTextAlternativeUI];
    /**
     * @inheritDoc
     */
    static get pluginName(): "ImageTextAlternative";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
