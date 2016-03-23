// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ITransformer
} from './transformime';

import * as Convert
  from 'ansi-to-html';

import {
  Widget
} from 'phosphor-widget';

import {
  MathWidget
} from './mathwidget';

/**
 * A transformer for raw html.
 */
export
class HTMLTransformer implements ITransformer<Widget> {
  mimetypes = ['text/html'];
  transform(mimetype: string, data: string): Widget {
    let w = new MathWidget();
    w.setInnerHTML(data);
    return w;
  }
}


/**
 * A transformer for `<img>` data.
 */
export
class ImageTransformer implements ITransformer<Widget> {
  mimetypes = ['image/png', 'image/jpeg', 'image/gif'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    let img = document.createElement('img');
    img.src = `data:${mimetype};base64,${data}`;
    w.node.appendChild(img);
    return w;
  }
}


/**
 * A transformer for raw `textContent` data.
 */
export
class TextTransformer implements ITransformer<Widget> {
  mimetypes = ['text/plain'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.textContent = data;
    return w;
  }
}


/**
 * A transformer for Jupyter console text data.
 */
export
class ConsoleTextTransformer implements ITransformer<Widget> {
  mimetypes = ['application/vnd.jupyter.console-text'];

  constructor() {
    this._converter = new Convert({
      escapeXML: true,
      newline: true
    });
  }

  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.textContent = this._converter.toHtml(data);
    return w;
  }

  private _converter: Convert = null;
}


/**
 * A transformer for raw `<script>` data.
 */
export
class JavascriptTransformer implements ITransformer<Widget> {
  mimetypes = ['text/javascript', 'application/javascript'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    let s = document.createElement('script');
    s.type = mimetype;
    s.textContent = data;
    w.node.appendChild(s);
    return w;
  }
}


/**
 * A transformer for `<svg>` data.
 */
export
class SVGTransformer implements ITransformer<Widget> {
  mimetypes = ['image/svg+xml'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.innerHTML = data;
    let svgElement = w.node.getElementsByTagName('svg')[0];
    if (!svgElement) {
      throw new Error("SVGTransform: Error: Failed to create <svg> element");
    }
    return w;
  }
}


/**
 * A transformer for LateX data.
 */
export
class LatexTransformer implements ITransformer<Widget> {
  mimetypes = ['text/latex'];
  transform(mimetype: string, data: string): Widget {
    let w = new MathWidget();
    w.setTextContent(data);
    return w;
  }
}
