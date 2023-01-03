import { LitElement, customElement, property } from 'lit-element';
import { PropertyValues } from 'lit';

import { uniqueIdGenerator } from '@yeti-wc/utils';
import { ListItemComponent, LIST_ITEM_SELECTOR } from './list-item';
import { ListManager } from './list-managers/list-manager';
import { ActiveDescendantListManager } from './list-managers/active-descendant.list-manager';
import { ListOrientation } from './types';
import { FocusListManager } from './list-managers/focus.list-manager';

const getNextId = uniqueIdGenerator('yt-listbox');

const nodesContainListItems = (nodeList: NodeList): boolean => {
	return Array.from(nodeList).some(node => node instanceof ListItemComponent);
};

@customElement('yt-list')
export class ListComponent extends LitElement {
	private _contentObserver = new MutationObserver(mutations => this._onContentChange(mutations));

	private _listManager!: ListManager<ListItemComponent>;

	private _wrap = true;

	@property({ type: String, reflect: true })
	override role = 'listbox';

	@property({ type: Boolean, attribute: true })
	set wrap(shouldWrap: boolean) {
		this._wrap = shouldWrap;
		this._listManager?.withWrap(shouldWrap);
	}

	@property({ type: Boolean, attribute: 'aria-disabled', reflect: true })
	disabled = false;

	@property({ type: Number, reflect: true, attribute: 'tabindex' })
	override tabIndex = 0;

	@property({ attribute: 'id', type: String, reflect: true })
	override id = getNextId();

	// TODO create orientation type and move to some file
	@property({ attribute: 'aria-orientation', reflect: true, type: String })
	orientation: ListOrientation = 'vertical';

	@property({ type: Boolean })
	useActiveDescendant = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this._attachEventListeners();
	}

	override disconnectedCallback(): void {
		super.disconnectedCallback();
		this._contentObserver.disconnect();
		this._listManager.detach();
	}

	protected override updated(_changedProperties: PropertyValues<ListComponent>): void {
		super.updated(_changedProperties);
		const orientation = _changedProperties.get('orientation');
		if (orientation) {
			this._listManager.withOrientation(orientation);
		}
	}

	protected override createRenderRoot(): Element | ShadowRoot {
		return this;
	}

	private _attachEventListeners(): void {
		this._contentObserver.observe(this, { childList: true, attributes: false });
		const listManager = this.useActiveDescendant
			? new ActiveDescendantListManager<ListItemComponent>()
			: new FocusListManager<ListItemComponent>();
		this._listManager = listManager.withWrap(this._wrap).withOrientation(this.orientation);
		this._listManager.attachToElement(this, this._queryItems());
	}

	/**
	 * This handler needs to launch re-querying of the child list item elements
	 * only if something has changed: there are list-item nodes added or removed.
	 */
	private _onContentChange(mutationRecords: MutationRecord[]): void {
		const hasChanged = mutationRecords.some(({ addedNodes, removedNodes }) => {
			return nodesContainListItems(addedNodes) || nodesContainListItems(removedNodes);
		});

		if (hasChanged) {
			this._updateItems();
		}
	}

	private _updateItems(): void {
		this._listManager.updateItems(this._queryItems());
	}

	private _queryItems(): ListItemComponent[] {
		return Array.from(this.renderRoot.querySelectorAll(LIST_ITEM_SELECTOR));
	}
}
