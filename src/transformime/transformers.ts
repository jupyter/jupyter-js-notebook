// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

import {
  ITransformer
} from './transformime';

import {
  Widget
} from 'phosphor-widget';


export
class HTMLTransformer implements ITransformer<Widget> {
  mimetypes = ['text/html'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.innerHTML = data;
    return w;
  }
}

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

export
class TextTransformer implements ITransformer<Widget> {
  mimetypes = ['text/plain'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.textContent = data;
    return w;
  }
}

export
class ConsoleTextTransformer implements ITransformer<Widget> {
  mimetypes = ['application/vnd.jupyter.console-text'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    // See https://github.com/nteract/transformime-jupyter-transformers/blob/master/src/console-text.transform.js
    w.node.textContent = data;
    return w;
  }
}

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

export
class SVGTransformer implements ITransformer<Widget> {
  mimetypes = ['image/svg+xml'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.innerHTML = data;
    return w;
  }
}

export
class LatexTransformer implements ITransformer<Widget> {
  mimetypes = ['text/latex'];
  transform(mimetype: string, data: string): Widget {
    let w = new Widget();
    w.node.textContent = data;
    // TODO: do something to the class to get MathJax to render it?
    // TODO: use katex if mathjax isn't defined?
    return w;
  }
}
