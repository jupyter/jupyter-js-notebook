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
  constructor(transformers: ITransformer<T>[]) {
    this._transformers = transformers;
  }

  transform(bundle: MimeMap<string>): T {
    for (let t of this._transformers) {
      for (let m of t.mimetypes) {
        if (bundle.hasOwnProperty(m)) {
            return t.transform(m, bundle[m])
        }
      }
    }
  }
  
  preferredMimetype(bundle: MimeMap<string>): string {
    for (let t of this._transformers) {
      for (let m of t.mimetypes) {
        if (bundle.hasOwnProperty(m)) {
            return m;
        }
      }
    }
  }
  
  get transformers() {
      return this._transformers;
  }
  
  private _transformers: ITransformer<T>[]
}
