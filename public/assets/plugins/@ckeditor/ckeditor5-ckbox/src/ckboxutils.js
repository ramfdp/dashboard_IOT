/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
import { CKEditorError, logError } from 'ckeditor5/src/utils.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { convertMimeTypeToExtension, getContentTypeOfUrl, getFileExtension, getWorkspaceId, sendHttpRequest } from './utils.js';
const DEFAULT_CKBOX_THEME_NAME = 'lark';
/**
 * The CKBox utilities plugin.
 */
export default class CKBoxUtils extends Plugin {
    /**
     * @inheritDoc
     */
    static get pluginName() {
        return 'CKBoxUtils';
    }
    /**
     * @inheritDoc
     */
    static get isOfficialPlugin() {
        return true;
    }
    /**
     * @inheritDoc
     */
    static get requires() {
        return ['CloudServices'];
    }
    /**
     * @inheritDoc
     */
    init() {
        const editor = this.editor;
        const hasConfiguration = !!editor.config.get('ckbox');
        const isLibraryLoaded = !!window.CKBox;
        // Proceed with plugin initialization only when the integrator intentionally wants to use it, i.e. when the `config.ckbox` exists or
        // the CKBox JavaScript library is loaded.
        if (!hasConfiguration && !isLibraryLoaded) {
            return;
        }
        editor.config.define('ckbox', {
            serviceOrigin: 'https://api.ckbox.io',
            defaultUploadCategories: null,
            ignoreDataId: false,
            language: editor.locale.uiLanguage,
            theme: DEFAULT_CKBOX_THEME_NAME,
            tokenUrl: editor.config.get('cloudServices.tokenUrl')
        });
        const cloudServices = editor.plugins.get('CloudServices');
        const cloudServicesTokenUrl = editor.config.get('cloudServices.tokenUrl');
        const ckboxTokenUrl = editor.config.get('ckbox.tokenUrl');
        if (!ckboxTokenUrl) {
            /**
             * The {@link module:ckbox/ckboxconfig~CKBoxConfig#tokenUrl `config.ckbox.tokenUrl`} or the
             * {@link module:cloud-services/cloudservicesconfig~CloudServicesConfig#tokenUrl `config.cloudServices.tokenUrl`}
             * configuration is required for the CKBox plugin.
             *
             * ```ts
             * ClassicEditor.create( document.createElement( 'div' ), {
             * 	ckbox: {
             * 		tokenUrl: "YOUR_TOKEN_URL"
             * 		// ...
             * 	}
             * 	// ...
             * } );
             * ```
             *
             * @error ckbox-plugin-missing-token-url
             */
            throw new CKEditorError('ckbox-plugin-missing-token-url', this);
        }
        if (ckboxTokenUrl == cloudServicesTokenUrl) {
            this._token = Promise.resolve(cloudServices.token);
        }
        else {
            this._token = cloudServices.registerTokenUrl(ckboxTokenUrl);
        }
    }
    /**
     * Returns a token used by the CKBox plugin for communication with the CKBox service.
     */
    getToken() {
        return this._token;
    }
    /**
     * The ID of workspace to use when uploading an image.
     */
    async getWorkspaceId() {
        const t = this.editor.t;
        const cannotAccessDefaultWorkspaceError = t('Cannot access default workspace.');
        const defaultWorkspaceId = this.editor.config.get('ckbox.defaultUploadWorkspaceId');
        const workspaceId = getWorkspaceId(await this._token, defaultWorkspaceId);
        if (workspaceId == null) {
            /**
             * The user is not authorized to access the workspace defined in  the`ckbox.defaultUploadWorkspaceId` configuration.
             *
             * @error ckbox-access-default-workspace-error
             */
            logError('ckbox-access-default-workspace-error');
            throw cannotAccessDefaultWorkspaceError;
        }
        return workspaceId;
    }
    /**
     * Resolves a promise with an object containing a category with which the uploaded file is associated or an error code.
     */
    async getCategoryIdForFile(fileOrUrl, options) {
        const t = this.editor.t;
        const cannotFindCategoryError = t('Cannot determine a category for the uploaded file.');
        const defaultCategories = this.editor.config.get('ckbox.defaultUploadCategories');
        const allCategoriesPromise = this._getAvailableCategories(options);
        const extension = typeof fileOrUrl == 'string' ?
            convertMimeTypeToExtension(await getContentTypeOfUrl(fileOrUrl, options)) :
            getFileExtension(fileOrUrl);
        const allCategories = await allCategoriesPromise;
        // Couldn't fetch all categories. Perhaps the authorization token is invalid.
        if (!allCategories) {
            throw cannotFindCategoryError;
        }
        // If a user specifies the plugin configuration, find the first category that accepts the uploaded file.
        if (defaultCategories) {
            const userCategory = Object.keys(defaultCategories).find(category => {
                return defaultCategories[category].find(e => e.toLowerCase() == extension);
            });
            // If found, return its ID if the category exists on the server side.
            if (userCategory) {
                const serverCategory = allCategories.find(category => category.id === userCategory || category.name === userCategory);
                if (!serverCategory) {
                    throw cannotFindCategoryError;
                }
                return serverCategory.id;
            }
        }
        // Otherwise, find the first category that accepts the uploaded file and returns its ID.
        const category = allCategories.find(category => category.extensions.find(e => e.toLowerCase() == extension));
        if (!category) {
            throw cannotFindCategoryError;
        }
        return category.id;
    }
    /**
     * Resolves a promise with an array containing available categories with which the uploaded file can be associated.
     *
     * If the API returns limited results, the method will collect all items.
     */
    async _getAvailableCategories(options) {
        const ITEMS_PER_REQUEST = 50;
        const editor = this.editor;
        const token = this._token;
        const { signal } = options;
        const serviceOrigin = editor.config.get('ckbox.serviceOrigin');
        const workspaceId = await this.getWorkspaceId();
        try {
            const result = [];
            let offset = 0;
            let remainingItems;
            do {
                const data = await fetchCategories(offset);
                result.push(...data.items);
                remainingItems = data.totalCount - (offset + ITEMS_PER_REQUEST);
                offset += ITEMS_PER_REQUEST;
            } while (remainingItems > 0);
            return result;
        }
        catch {
            signal.throwIfAborted();
            /**
             * Fetching a list of available categories with which an uploaded file can be associated failed.
             *
             * @error ckbox-fetch-category-http-error
             */
            logError('ckbox-fetch-category-http-error');
            return undefined;
        }
        async function fetchCategories(offset) {
            const categoryUrl = new URL('categories', serviceOrigin);
            categoryUrl.searchParams.set('limit', String(ITEMS_PER_REQUEST));
            categoryUrl.searchParams.set('offset', String(offset));
            categoryUrl.searchParams.set('workspaceId', workspaceId);
            return sendHttpRequest({
                url: categoryUrl,
                signal,
                authorization: (await token).value
            });
        }
    }
}
