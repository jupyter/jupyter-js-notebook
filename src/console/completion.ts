// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  Message
} from 'phosphor-messaging';

import {
  Widget
} from 'phosphor-widget';

/**
 * The class name added to completion menu widgets.
 */
const COMPLETION_CLASS = 'jp-ConsoleCompletion';

/**
 * The class name added to completion menu contents.
 */
const CONTENT_CLASS = 'jp-ConsoleCompletion-content';

/**
 * The class name added to completion menu contents.
 */
const ITEM_CLASS = 'jp-ConsoleCompletion-item';


export
class ConsoleCompletion extends Widget {
  /**
   * Create the DOM node for a console completion menu.
   */
  static createNode(): HTMLElement {
    let node = document.createElement('div');
    let ul = document.createElement('ul');
    ul.className = CONTENT_CLASS;
    node.appendChild(ul);
    return node;
  }

  /**
   * Construct a console completion menu widget.
   */
  constructor() {
    super();
    this.addClass(COMPLETION_CLASS);
  }

  /**
   * The list element of the completion widget.
   *
   * #### Notes
   * This is a read-only property.
   */
  get listNode(): HTMLElement {
    return this.node.getElementsByTagName('ul')[0];
  }

  /**
   * This list of completion options.
   */
  get options(): string[] {
    return this._options;
  }
  set options(newValue: string[]) {
    // If the new value and the old value are falsey, return;
    if (newValue === this._options || !newValue && !this._options) {
      return;
    }
    if (newValue.join() === this._options.join()) {
      return;
    }
    this._options = newValue;
    this.update();
  }

  /**
   * Handle the DOM events for the widget.
   *
   * @param event - The DOM event sent to the widget.
   *
   * #### Notes
   * This method implements the DOM `EventListener` interface and is
   * called in response to events on the dock panel's node. It should
   * not be called directly by user code.
   */
  handleEvent(event: Event): void {
    switch (event.type) {
    case 'mousedown':
      this._evtMousedown(event as MouseEvent);
      break;
    }
  }

  /**
   * Handle `after_attach` messages for the widget.
   *
   * #### Notes
   * Captures document events in the capture phase to dismiss the tooltip.
   */
  protected onAfterAttach(msg: Message): void {
    this.node.addEventListener('mousedown', this, true);
  }

  /**
   * Handle `before_detach` messages for the widget.
   */
  protected onBeforeDetach(msg: Message): void {
    this.node.removeEventListener('mousedown', this);
  }

  /**
   * Handle `update_request` messages.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this._options && this._options.length) {
      let list = this.listNode;
      for (let i = 0, len = this._options.length; i < len; i++) {
        let item = document.createElement('li');
        item.className = ITEM_CLASS;
        item.innerHTML = this._options[i];
      }
    }
  }

  /**
   * Handle mousedown events for the widget.
   *
   * #### Notes
   * Hides the tooltip if a mousedown happens anywhere outside the tooltip.
   */
  private _evtMousedown(event: MouseEvent) {
    let target = event.target as HTMLElement;
    while (target !== this.node) {
      if (target.classList.contains(ITEM_CLASS)) {
        // TODO: return a value and dismiss the completion menu.
        return;
      }
      target = target.parentElement;
    }
  }

  private _options: string[] = null;
}


/**
 * A namespace for ConsoleCompletion widget private data.
 */
namespace Private {
}
