// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

/**
 * The interface for a transformer.
 */
export
interface ITransformer<T> {
  /**
   * The function that will render a mimebundle.
   *
   * @param mimetype - the mimetype for the data
   * @param data - the data to render
   */
  transform(mimetype: string, data: string): T;

  /**
   * The mimetypes this transformer accepts.
   */
  mimetypes: string[];
}


/**
 * A map of mimetypes to types.
 */
export
type MimeMap<T> = { [mimetype: string]: T };


/**
 * A composite transformer.
 *
 * #### Notes
 * When rendering a mimebundle, a mimetype is selected from the mimetypes by
 * searching through the `this.order` list. The first mimetype found in the bundle
 * determines the renderer that will be used.
 *
 * You can add a transformer by adding it to the `transformers` object and registering
 * the mimetype in the `order` array.
 */
export
class Transformime<T> {
  /**
   * Construct a transformer.
   *
   * @param transformers - a map of mimetypes to transformers.
   * @param order - a list of mimetypes in order of precedence (earliest one has precedence).
   */
  constructor(transformers: MimeMap<ITransformer<T>> = {}, order: string[] = []) {
    this._transformers = transformers;
    this._order = order;
  }

  /**
   * Transform (render) a mimebundle.
   *
   * @param bundle - the mimebundle to render.
   */
  transform(bundle: MimeMap<string>): T {
    let mimetype = this.preferredMimetype(bundle);
    if (mimetype) {
        return this.transformers[mimetype].transform(mimetype, bundle[mimetype]);
    }
  }
  
  /**
   * Find the preferred mimetype in a mimebundle.
   *
   * @param bundle - the mimebundle giving available mimetype content.
   */
  preferredMimetype(bundle: MimeMap<string>): string {
    for (let m of this.order) {
      if (bundle.hasOwnProperty(m)) {
        return m;
      }
    }
  }
  
  /**
   * Get the transformer map.
   */
  get transformers() {
      return this._transformers;
  }
  
  /**
   * Get the ordered list of mimetypes.
   *
   * #### Notes
   * These mimetypes are searched from beginning to end, and the first matching
   * mimetype is used.
   */
  get order() {
      return this._order;
  }
  
  private _transformers: MimeMap<ITransformer<T>>;
  private _order: string[];
}
