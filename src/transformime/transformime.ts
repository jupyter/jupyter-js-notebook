// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

export
interface ITransformer<T> {
  transform(mimetype: string, data: string): T;
  mimetypes: string[];
}

export
type MimeMap<T> = { [mimetype: string]: T };

export
class Transformime<T> {
  constructor(transformers: MimeMap<ITransformer<T>> = {}, order: string[] = []) {
    this._transformers = transformers;
    this._order = order;
  }

  transform(bundle: MimeMap<string>): T {
    let mimetype = this.preferredMimetype(bundle);
    if (mimetype) {
        return this.transformers[mimetype].transform(mimetype, bundle[mimetype]);
    }
  }
  
  preferredMimetype(bundle: MimeMap<string>): string {
    for (let m of this.order) {
      if (bundle.hasOwnProperty(m)) {
        return m;
      }
    }
  }
  
  get transformers() {
      return this._transformers;
  }
  
  get order() {
      return this._order;
  }
  
  private _transformers: MimeMap<ITransformer<T>>;
  private _order: string[];
}
