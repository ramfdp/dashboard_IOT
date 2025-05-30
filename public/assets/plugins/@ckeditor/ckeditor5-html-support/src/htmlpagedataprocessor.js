/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module html-support/htmlpagedataprocessor
 */
import { HtmlDataProcessor, UpcastWriter } from 'ckeditor5/src/engine.js';
/**
 * The full page HTML data processor class.
 * This data processor implementation uses HTML as input and output data.
 */
export default class HtmlPageDataProcessor extends HtmlDataProcessor {
    /**
     * @inheritDoc
     */
    toView(data) {
        // Ignore content that is not a full page source.
        if (!/<(?:html|body|head|meta)(?:\s[^>]*)?>/i.test(data.trim().slice(0, 10000))) {
            return super.toView(data);
        }
        // Store doctype and xml declaration in a separate properties as they can't be stringified later.
        let docType = '';
        let xmlDeclaration = '';
        data = data.trim().replace(/<\?xml\s[^?]*\?>/i, match => {
            xmlDeclaration = match;
            return '';
        });
        data = data.trim().replace(/^<!DOCTYPE\s[^>]*?>/i, match => {
            docType = match;
            return '';
        });
        // Convert input HTML data to DOM DocumentFragment.
        const domFragment = this._toDom(data);
        // Convert DOM DocumentFragment to view DocumentFragment.
        const viewFragment = this.domConverter.domToView(domFragment, { skipComments: this.skipComments });
        const writer = new UpcastWriter(viewFragment.document);
        // Using the DOM document with body content extracted as a skeleton of the page.
        writer.setCustomProperty('$fullPageDocument', domFragment.ownerDocument.documentElement.outerHTML, viewFragment);
        if (docType) {
            writer.setCustomProperty('$fullPageDocType', docType, viewFragment);
        }
        if (xmlDeclaration) {
            writer.setCustomProperty('$fullPageXmlDeclaration', xmlDeclaration, viewFragment);
        }
        return viewFragment;
    }
    /**
     * @inheritDoc
     */
    toData(viewFragment) {
        let data = super.toData(viewFragment);
        const page = viewFragment.getCustomProperty('$fullPageDocument');
        const docType = viewFragment.getCustomProperty('$fullPageDocType');
        const xmlDeclaration = viewFragment.getCustomProperty('$fullPageXmlDeclaration');
        if (page) {
            data = page.replace(/<\/body\s*>/, data + '$&');
            if (docType) {
                data = docType + '\n' + data;
            }
            if (xmlDeclaration) {
                data = xmlDeclaration + '\n' + data;
            }
        }
        return data;
    }
}
