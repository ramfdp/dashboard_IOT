/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */
/**
 * @module list/list/listmergecommand
 */
import { Command } from 'ckeditor5/src/core.js';
import { getNestedListBlocks, indentBlocks, sortBlocks, isFirstBlockOfListItem, mergeListItemBefore, isSingleListItem, getSelectedBlockObject, isListItemBlock } from './utils/model.js';
import ListWalker from './utils/listwalker.js';
/**
 * The document list merge command. It is used by the {@link module:list/list~List list feature}.
 */
export default class ListMergeCommand extends Command {
    /**
     * Creates an instance of the command.
     *
     * @param editor The editor instance.
     * @param direction Whether list item should be merged before or after the selected block.
     */
    constructor(editor, direction) {
        super(editor);
        this._direction = direction;
    }
    /**
     * @inheritDoc
     */
    refresh() {
        this.isEnabled = this._checkEnabled();
    }
    /**
     * Merges list blocks together (depending on the {@link #constructor}'s `direction` parameter).
     *
     * @fires execute
     * @fires afterExecute
     * @param options Command options.
     * @param options.shouldMergeOnBlocksContentLevel When set `true`, merging will be performed together
     * with {@link module:engine/model/model~Model#deleteContent} to get rid of the inline content in the selection or take advantage
     * of the heuristics in `deleteContent()` that helps convert lists into paragraphs in certain cases.
     */
    execute({ shouldMergeOnBlocksContentLevel = false } = {}) {
        const model = this.editor.model;
        const selection = model.document.selection;
        const changedBlocks = [];
        model.change(writer => {
            const { firstElement, lastElement } = this._getMergeSubjectElements(selection, shouldMergeOnBlocksContentLevel);
            const firstIndent = firstElement.getAttribute('listIndent') || 0;
            const lastIndent = lastElement.getAttribute('listIndent');
            const lastElementId = lastElement.getAttribute('listItemId');
            if (firstIndent != lastIndent) {
                const nestedLastElementBlocks = getNestedListBlocks(lastElement);
                changedBlocks.push(...indentBlocks([lastElement, ...nestedLastElementBlocks], writer, {
                    indentBy: firstIndent - lastIndent,
                    // If outdenting, the entire sub-tree that follows must be included.
                    expand: firstIndent < lastIndent
                }));
            }
            if (shouldMergeOnBlocksContentLevel) {
                let sel = selection;
                if (selection.isCollapsed) {
                    sel = writer.createSelection(writer.createRange(writer.createPositionAt(firstElement, 'end'), writer.createPositionAt(lastElement, 0)));
                }
                // Delete selected content. Replace entire content only for non-collapsed selection.
                model.deleteContent(sel, { doNotResetEntireContent: selection.isCollapsed });
                // Get the last "touched" element after deleteContent call (can't use the lastElement because
                // it could get merged into the firstElement while deleting content).
                const lastElementAfterDelete = sel.getLastPosition().parent;
                // Check if the element after it was in the same list item and adjust it if needed.
                const nextSibling = lastElementAfterDelete.nextSibling;
                changedBlocks.push(lastElementAfterDelete);
                if (nextSibling && nextSibling !== lastElement && nextSibling.getAttribute('listItemId') == lastElementId) {
                    changedBlocks.push(...mergeListItemBefore(nextSibling, lastElementAfterDelete, writer));
                }
            }
            else {
                changedBlocks.push(...mergeListItemBefore(lastElement, firstElement, writer));
            }
            this._fireAfterExecute(changedBlocks);
        });
    }
    /**
     * Fires the `afterExecute` event.
     *
     * @param changedBlocks The changed list elements.
     */
    _fireAfterExecute(changedBlocks) {
        this.fire('afterExecute', sortBlocks(new Set(changedBlocks)));
    }
    /**
     * Checks whether the command can be enabled in the current context.
     *
     * @returns Whether the command should be enabled.
     */
    _checkEnabled() {
        const model = this.editor.model;
        const selection = model.document.selection;
        const selectedBlockObject = getSelectedBlockObject(model);
        if (selection.isCollapsed || selectedBlockObject) {
            const positionParent = selectedBlockObject || selection.getFirstPosition().parent;
            if (!isListItemBlock(positionParent)) {
                return false;
            }
            const siblingNode = this._direction == 'backward' ?
                positionParent.previousSibling :
                positionParent.nextSibling;
            if (!siblingNode) {
                return false;
            }
            if (isSingleListItem([positionParent, siblingNode])) {
                return false;
            }
        }
        else {
            const lastPosition = selection.getLastPosition();
            const firstPosition = selection.getFirstPosition();
            // If deleting within a single block of a list item, there's no need to merge anything.
            // The default delete should be executed instead.
            if (lastPosition.parent === firstPosition.parent) {
                return false;
            }
            if (!isListItemBlock(lastPosition.parent)) {
                return false;
            }
        }
        return true;
    }
    /**
     * Returns the boundary elements the merge should be executed for. These are not necessarily selection's first
     * and last position parents but sometimes sibling or even further blocks depending on the context.
     *
     * @param selection The selection the merge is executed for.
     * @param shouldMergeOnBlocksContentLevel When `true`, merge is performed together with
     * {@link module:engine/model/model~Model#deleteContent} to remove the inline content within the selection.
     */
    _getMergeSubjectElements(selection, shouldMergeOnBlocksContentLevel) {
        const model = this.editor.model;
        const selectedBlockObject = getSelectedBlockObject(model);
        let firstElement, lastElement;
        if (selection.isCollapsed || selectedBlockObject) {
            const positionParent = selectedBlockObject || selection.getFirstPosition().parent;
            const isFirstBlock = isFirstBlockOfListItem(positionParent);
            if (this._direction == 'backward') {
                lastElement = positionParent;
                if (isFirstBlock && !shouldMergeOnBlocksContentLevel) {
                    // For the "c" as an anchorElement:
                    //  * a
                    //    * b
                    //  * [c]  <-- this block should be merged with "a"
                    // It should find "a" element to merge with:
                    //  * a
                    //    * b
                    //    c
                    firstElement = ListWalker.first(positionParent, { sameIndent: true, lowerIndent: true });
                }
                else {
                    firstElement = positionParent.previousSibling;
                }
            }
            else {
                // In case of the forward merge there is no case as above, just merge with next sibling.
                firstElement = positionParent;
                lastElement = positionParent.nextSibling;
            }
        }
        else {
            firstElement = selection.getFirstPosition().parent;
            lastElement = selection.getLastPosition().parent;
        }
        return {
            firstElement: firstElement,
            lastElement: lastElement
        };
    }
}
