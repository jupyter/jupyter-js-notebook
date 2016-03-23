// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  Message
} from 'phosphor-messaging';

import {
  Widget
} from 'phosphor-widget';

import {
  typeset
} from '../utils/latex';


/**
 * A widget which typesets itself after it is attached.  
 */
export
class MathWidget extends Widget {
  /**
   * A message handler invoked on an `'after-attach'` message.
   * 
   * ####Notes
   * If the node is visible, it is typeset.
   */
  onAfterAttach(msg: Message) {
    // In the case of the katex fallback, we could have typeset *before* the attach
    // We can fix this if it becomes a performance issue.
    if (this._dirty) {
      this.typeset();
    }
  }
  
  /**
   * Typeset the contents of the node.
   */
  typeset() {
    typeset(this.node);
  }
  
  /**
   * Set the text content of the node.
   *
   * @param content - the content to set
   *  
   * ####Notes
   * Use this instead of setting the content directly to ensure
   * it is only typeset once.
   * 
   * **See also:** [[setInnerHTML]]
   */
  setTextContent(content: string) {
    this.node.textContent = content;
    this._dirty = true;
  }
  
  /**
   * Set the HTML content of the node.
   *
   * @param content - the content to set
   *  
   * ####Notes
   * Use this instead of setting the content directly to ensure
   * it is only typeset once.
   * 
   * **See also:** [[setTextContent]]
   */
  setInnerHTML(content: string) {
    this.node.innerHTML = content;
    this._dirty = true;
  }
  
  private _dirty: boolean;
}
