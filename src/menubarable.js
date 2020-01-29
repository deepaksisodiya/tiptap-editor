import { Plugin } from 'prosemirror-state';
import { renderGrouped } from 'prosemirror-menu';
import crel from 'crel';

import { isSafari, iOS, supportsViewPort } from '../../utils';

const prefix = 'ProseMirror-menubar';

class MenuBarView {
  constructor(editorView, options) {
    this.editorView = editorView;
    this.options = options;

    crel(this.options.$container, (this.menu = crel('div', { class: prefix })));
    this.spacer = null;

    this.maxHeight = 0;
    this.widthForMaxHeight = 0;

    const { dom, update } = renderGrouped(this.editorView, this.options.content);
    this.contentUpdate = update;
    this.menu.appendChild(dom);
    this.update();

    this.editorView.dom.addEventListener('focusin', () => {
      this.menu.classList.add('interactable');
    });

    this.editorView.dom.addEventListener('focusout', () => {
      this.menu.classList.remove('interactable');
    });

    if (isSafari && iOS) {
      const menuHeight = 60;
      this.menu.style.position = 'absolute';
      this.menu.style.margin = 0;
      this.menu.style.height = `${menuHeight}px`;
      this.menu.style.paddingBottom = 'initial';
      this.menu.style.transition = 'all .25s ease-in-out';

      if (supportsViewPort) {
        const viewport = window.visualViewport;

        const update = () => {
          this.menu.style.top = `${viewport.height + viewport.pageTop - menuHeight}px`;

          requestAnimationFrame(update);
        };

        requestAnimationFrame(update);

        let timeout;
        window.addEventListener('scroll', () => {
          if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
          }

          this.menu.classList.add('hidden');
          timeout = setTimeout(() => {
            this.menu.classList.remove('hidden');
          }, 200);
        });
      } else {
        this.editorView.dom.style.marginBottom = 0;

        const update = () => {
          this.menu.style.top = `${
            window.pageYOffset > menuHeight + 5 ? window.pageYOffset : menuHeight + 5
          }px`;
        };

        update();
        window.addEventListener('scroll', update);
        window.addEventListener('resize', update);
      }
    }
  }

  update() {
    this.contentUpdate(this.editorView.state);
  }
}

// :: (Object) → Plugin
// A plugin that will place a menu bar above the editor. Note that
// this involves wrapping the editor in an additional `<div>`.
//
//   options::-
//   Supports the following options:
//
//     content:: [[MenuElement]]
//     Provides the content of the menu, as a nested array to be
//     passed to `renderGrouped`.
//
//     floating:: ?bool
//     Determines whether the menu floats, i.e. whether it sticks to
//     the top of the viewport when the editor is partially scrolled
//     out of view.
export function menuBar(options) {
  return new Plugin({
    view(editorView) {
      return new MenuBarView(editorView, options);
    },
  });
}
