/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module typing/typing
 */
import { Plugin } from '@ckeditor/ckeditor5-core';
import Input from './input.js';
import Delete from './delete.js';
/**
 * The typing feature. It handles typing.
 *
 * This is a "glue" plugin which loads the {@link module:typing/input~Input} and {@link module:typing/delete~Delete}
 * plugins.
 */
export default class Typing extends Plugin {
    static get requires(): readonly [typeof Input, typeof Delete];
    /**
     * @inheritDoc
     */
    static get pluginName(): "Typing";
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin(): true;
}
