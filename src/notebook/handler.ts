// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
'use strict';

import {
  IContentsModel, IContentsManager, INotebookSessionManager, getKernelSpecs,
  KernelStatus, IContentsOpts, IKernelSpecIds, INotebookSession
} from 'jupyter-js-services';

import {
  AbstractFileHandler, FileCreator
} from 'jupyter-js-ui/lib/filehandler';

import {
  RenderMime
} from 'jupyter-js-ui/lib/rendermime';

import {
  showDialog
} from 'jupyter-js-ui/lib/dialog';

import {
  IChangedArgs
} from 'phosphor-properties';

import {
  Widget
} from 'phosphor-widget';

import {
  findKernel
} from '../kernel-selector';

import {
  NotebookManager
} from './manager';

import {
  INotebookModel, NotebookModel
} from './model';

import {
  deserialize, serialize
} from './serialize';

import {
  NotebookPanel
} from './widget';

import {
  ISignal, Signal, clearSignalData
} from 'phosphor-signaling';


export
class NotebookContext {
  constructor(widget: NotebookPanel) {
    this.widget = widget;
  }
  widget: NotebookPanel;
}

/**
 * A class providing various signals for notebooks.
 */
export
class NotebookSignals {
  /**
   * A signal emitted when a notebook is created.
   */
  get newNotebookSignal(): ISignal<NotebookSignals, NotebookContext> {
    return NotebookModelPrivate.newNotebookSignal.bind(this);
  }

  // Perhaps we should just have an observable list of notebooks and just connect to that.
}

namespace NotebookModelPrivate {
  /**
   * A signal emitted when a new notebook is created.
   */
  export
  const newNotebookSignal = new Signal<NotebookSignals, NotebookContext>();
}


/**
 * An implementation of a notebook file handler.
 */
export
class NotebookFileHandler extends AbstractFileHandler<NotebookPanel> {

  /**
   * Construct a notebook file handler.
   *
   * @param contents - A contents manager.
   * @param session - A session manager.
   * @param rendermime - A global rendermime instance that is cloned for each notebook.
   * @param nbsignals - A NotebookSignals object that we will emit signals on when a notebook is created.
   */
  constructor(contents: IContentsManager, session: INotebookSessionManager,
              rendermime: RenderMime<Widget>, nbsignals: NotebookSignals) {
    super(contents);
    this._session = session;
    this._rendermime = rendermime;
    this._kernelSpecs = getKernelSpecs({});
    this._nbsignals = nbsignals;
  }

  /**
   * Get the list of file extensions supported by the handler.
   */
  get fileExtensions(): string[] {
    return ['.ipynb'];
  }

  /**
   * Get the notebook session manager.
   */
  get sessionManager(): INotebookSessionManager {
    return this._session;
  }

  /**
   * Get the kernel specs.
   */
  getKernelSpecs(): Promise<IKernelSpecIds> {
    return this._kernelSpecs;
  }

  /**
   * Set the dirty state of a file.
   */
  setDirty(path: string): void {
    super.setDirty(path);
    let widget = this.findWidget(path);
    widget.model.dirty = true;
  }

  /**
   * Clear the dirty state of a file.
   */
  clearDirty(path: string): void {
    super.clearDirty(path);
    let widget = this.findWidget(path);
    widget.model.dirty = false;
  }

  /**
   * Get options use to fetch the model contents from disk.
   */
  protected getFetchOptions(model: IContentsModel): IContentsOpts {
    return { type: 'notebook' };
  }

  /**
   * Get the options used to save the widget content.
   */
  protected getSaveOptions(widget: NotebookPanel, model: IContentsModel): Promise<IContentsOpts> {
      let content = serialize(widget.model);
      return Promise.resolve({ type: 'notebook', content });
  }

  /**
   * Create the widget from an `IContentsModel`.
   */
  protected createWidget(contents: IContentsModel): NotebookPanel {
    let model = new NotebookModel();
    let manager = new NotebookManager(model, this.manager);

    // We may make notebook-specific changes to the rendermime in notebook extensions,
    // so clone the global instance
    let rendermime = this._rendermime.clone();

    let panel = new NotebookPanel(manager, rendermime);
    panel.model.stateChanged.connect((model, args) => {
      if (args.name !== 'dirty') {
        return;
      }
      if (args.newValue) {
        this.setDirty(contents.path);
      } else {
        this.clearDirty(contents.path);
      }
    });
    panel.title.text = contents.name;
    this._nbsignals.newNotebookSignal.emit(new NotebookContext(panel))
    return panel;
  }

  /**
   * Populate the notebook widget with the contents of the notebook.
   */
  protected populateWidget(widget: NotebookPanel, model: IContentsModel): Promise<IContentsModel> {
    deserialize(model.content, widget.model);
    return this._findSession(model).then(session => {
      if (session !== void 0) {
        return session;
      }
      return this._kernelSpecs.then(specs => {
        let kernelName = widget.model.kernelspec.name;
        let langName = widget.model.languageInfo.name;
        let name = findKernel(kernelName, langName, specs);
        return this._session.startNew({
          kernelName: name,
          notebookPath: model.path
        });
      });
    }).then(session => {
      widget.model.session = session;
      return model;
    });
  }

  /**
   * Find a running session given a contents model.
   */
  private _findSession(model: IContentsModel): Promise<INotebookSession> {
    return this._session.findByPath(model.path).then(sessionId => {
      return this._session.connectTo(sessionId.id);
    }).catch(() => {
      return void 0;
    });
  }

  private _session: INotebookSessionManager = null;
  private _kernelSpecs: Promise<IKernelSpecIds> = null;
  private _rendermime: RenderMime<Widget> = null;
  private _nbsignals: NotebookSignals = null;
}


/**
 * A notebook creator implementation.
 */
export
class NotebookCreator extends FileCreator {
  /**
   * Create the dialog for a notebook creator.
   */
  static createDialog(): HTMLElement {
    let node = document.createElement('div');
    let input = document.createElement('input');
    let select = document.createElement('select');
    node.appendChild(input);
    node.appendChild(select);
    return node;
  }

  /**
   * Construct a new notebook creator.
   */
  constructor(handler: NotebookFileHandler) {
    super(handler.manager, 'notebook');
    this._handler = handler;
    handler.getKernelSpecs().then(specs => {
      let selector = this.kernelNode;
      let options: HTMLOptionElement[] = [];
      for (let name in specs.kernelspecs) {
        let option = document.createElement('option');
        option.value = name;
        option.text = specs.kernelspecs[name].spec.display_name;
        options.push(option);
      }
      options.sort((a, b) => { return a.text.localeCompare(b.text); });
      for (let option of options) {
        selector.appendChild(option);
      }
      selector.value = specs.default;
    });
  }

  /**
   * Get the kernel select node.
   */
  get kernelNode(): HTMLSelectElement {
    return this.body.getElementsByTagName('select')[0];
  }

  /**
   * Rename a file or directory.
   */
  protected doRename(contents: IContentsModel): Promise<IContentsModel> {
    return super.doRename(contents).then(contents => {
      let kernelName = this.kernelNode.value;
      let manager = this._handler.sessionManager;
      return manager.startNew({
        kernelName,
        notebookPath: contents.path
      });
    }).then(() => { return contents; });
  };

  private _handler: NotebookFileHandler = null;
}
