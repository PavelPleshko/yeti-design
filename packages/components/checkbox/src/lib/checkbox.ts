import { customElement, html, LitElement, property, nothing, query, state } from 'lit-element';
import { TemplateResult } from 'lit';
import { ClassInfo, classMap } from 'lit/directives/class-map.js';
import { CSSResultGroup } from '@lit/reactive-element/css-tag';
import { forwardAttribute } from '@yeti-wc/utils';

// @ts-expect-error: figure out the broken imports
import style from './checkbox.scss';

// TODO move keys to utils as constants
const CHECKBOX_ACTIVATION_KEYS = [' ', 'Enter'];

@customElement('yt-checkbox')
export class Checkbox extends LitElement {
	static override shadowRootOptions: ShadowRootInit = { mode: 'open' };

	static override get styles(): CSSResultGroup {
		return [style];
	}

	@query('input') private readonly _inputElement!: HTMLInputElement | null;

	// TODO generate these ids with some generator
	@forwardAttribute('id')
	_id = 'checkbox-id-1';

	@forwardAttribute('name')
	_name?: string;

	@forwardAttribute('aria-label')
	_ariaLabel?: string;

	@forwardAttribute('aria-labelledby')
	_ariaLabelledBy?: string;

	@property({ type: Boolean })
	checked = false;

	@property({ type: Number, reflect: true })
	override tabIndex = 0;

	@property({ type: Boolean })
	disabled = false;

	@state()
	focused = false;

	override connectedCallback(): void {
		super.connectedCallback();
		this._attachDelegateListeners();
	}

	override focus(_options?: FocusOptions): void {
		this._inputElement?.focus();
	}

	protected override render(): TemplateResult {
		return html`
			<span class="${classMap(this._getCheckboxContainerClasses())}">
				<span class="yt-checkbox--container--focus-indicator"></span>
				<span class="yt-checkbox--container--outline"></span>
				<svg viewBox="0 0 24 24" class="yt-checkbox--container--checkmark" aria-hidden="true" focusable="false">
					<path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"></path>
				</svg>
			</span>
			<input
				tabindex="-1"
				type="checkbox"
				aria-label="${this._ariaLabel || nothing}"
				aria-labelledby="${this._ariaLabelledBy || nothing}"
				name="${this._name || nothing}"
				id="${this._id}"
				@focus="${this._onFocus}"
				@blur="${this._onBlur}"
				.checked="${this.checked}"
				?disabled="${this.disabled}" />
		`;
	}

	private _getCheckboxContainerClasses(): ClassInfo {
		return {
			'yt-checkbox--container': true,
			'yt-checkbox--container--checked': this.checked,
			'yt-checkbox--container--focused': this.focused,
		};
	}

	private _attachDelegateListeners(): void {
		this.addEventListener('click', _ => this._onClick());
		this.addEventListener('keydown', event => this._onKeyDown(event));
		this.addEventListener('focus', _ => this.focus());
	}

	private _onClick(): void {
		this._toggleState();
	}

	private _onKeyDown(event: KeyboardEvent): void {
		if (CHECKBOX_ACTIVATION_KEYS.includes(event.key)) {
			event.preventDefault();
			event.stopPropagation();
			this._toggleState();
		}
	}

	private _onFocus(): void {
		this.focused = true;
	}

	private _onBlur(): void {
		this.focused = false;
	}

	private _toggleState(): void {
		this.checked = !this.checked;
	}
}
