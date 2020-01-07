import { Node } from "tiptap";

export default class EmbedNode extends Node {
  get name() {
    return "embed";
  }

  get schema() {
    return {
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
              src: dom.getAttribute("src"),
              caption: dom.getAttribute("caption")
            };
          }
        }
      ],
      toDOM: node => ["embed", node.attrs]
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
      mounted() {
        if (this.src) this.isIframeLoaded = true;
        else {
          this.$nextTick(() => {
            this.$refs.embedInput.focus();
          });
        }
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
          let provider = null;

          this.src.match(
            /(http:|https:|)\/\/(player.|www.)?(vimeo\.com|youtu(be\.com|\.be|be\.googleapis\.com))\/(video\/|embed\/|watch\?v=|v\/)?([A-Za-z0-9._%-]*)(&\S+)?/
          );

          if (RegExp.$3.indexOf("youtu") > -1) {
            provider = "youtube";
            this.src = this.getYTEmbedUrl();
          }

          if (provider) this.isIframeLoaded = true;
        },
        getYTEmbedUrl() {
          const urlArr = this.src.split("=");
          return "https://www.youtube.com/embed/" + urlArr[1];
        }
      },
      template: `
        <div>
          <div v-if="isIframeLoaded">
            <iframe :src="src"></iframe>
            <input type="text" v-model="caption" :disabled="!view.editable" placeholder="write caption (optional)" />
          </div>
          <div v-else>
            <input ref="embedInput" @paste.stop type="text" v-model="src" :disabled="!view.editable" />
            <button @click="onClickButton">Embeds</button>
          </div>
        </div>
      `
    };
  }
}
