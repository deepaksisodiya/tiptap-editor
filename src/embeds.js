import { Node } from "tiptap";

export default class EmbedsNode extends Node {
  // name of the component
  get name() {
    return "embeds";
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        src: {
          default: null
        },
        caption: {
          default: null
        }
      },
      group: "block",
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [
        {
          tag: this.name,
          getAttrs: dom => {
            return {
              src: dom.getAttribute("src")
            };
          }
        }
      ],
      toDOM: () => [
        "div",
        {
          allowfullscreen: "true",
          class: "emebds"
        }
      ]
    };
  }

  commands({ type }) {
    return () => (state, dispatch) =>
      dispatch(state.tr.replaceSelectionWith(type.create()));
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view"],
      data() {
        return {
          isIframeLoaded: false
        };
      },
      computed: {
        src: {
          get() {
            return this.node.attrs.src;
          },
          set(src) {
            this.updateAttrs({
              src
            });
          }
        },
        caption: {
          get() {
            return this.node.attrs.caption;
          },
          set(caption) {
            this.updateAttrs({
              caption
            });
          }
        }
      },
      methods: {
        onClickButton() {
          if (!this.src) return;
          this.isIframeLoaded = true;
        }
      },
      template: `
        <div>
          <div v-if="isIframeLoaded">
            <iframe :src="src"></iframe>
            <input type="text" v-model="caption" :disabled="!view.editable" placeholder="write caption (optional)" />
          </div>
          <div v-else>
            <input @paste.stop type="text" v-model="src" :disabled="!view.editable" />
            <button @click="onClickButton">Embeds</button>
          </div>
        </div>
      `
    };
  }
}
