import { Node, TextSelection } from "tiptap";
import axios from "axios";

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
      selectable: true,
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
    return () => (state, dispatch) => {
      return dispatch(state.tr.replaceSelectionWith(type.create()));
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos"],
      data() {
        return {
          embeds: {
            isLoading: false,
            isError: false,
            data: null
          }
        };
      },
      mounted() {
        if (this.validURL(this.src)) {
          this.embeds.data = { iframeUrl: this.src };
        } else {
          if (!this.src) {
            this.$nextTick(() => {
              this.$refs.embedInput.focus();
            });
          }
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
        async onClickAdd() {
          if (!this.src) return;
          const isUrl = this.validURL(this.src);

          if (!isUrl) {
            this.createAndMovetoNextParagraph();
          } else {
            this.embeds.isLoading = true;
            this.embeds.isError = false;
            try {
              const response = await axios("http://localhost:3000/embeds");
              this.embeds.data = response.data;
              // for copy pasting to work
              this.src = response.data.iframeUrl;
            } catch (error) {
              this.embeds.isError = true;
            } finally {
              // move cursor to new paragraph
              const pos = this.getPos();
              this.embeds.isLoading = false;
              let tr = this.view.state.tr;
              let textSelection = TextSelection.create(
                tr.doc,
                pos + 1,
                pos + 1
              );
              tr = tr.setSelection(textSelection);
              this.view.dispatch(tr);
              // focus the editor
              this.view.focus();
            }
          }
        },
        createAndMovetoNextParagraph() {
          let {
            state: { tr, schema }
          } = this.view;
          const pos = this.getPos();
          // replce embeds with paragraph
          let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
          tr = tr.setSelection(textSelection).insertText(this.src);

          // create new paragraph
          const type = schema.nodes["paragraph"];
          tr = tr.insert(pos + this.src.length + 2, type.create());
          // move cursor to new paragraph
          textSelection = TextSelection.create(
            tr.doc,
            pos + this.src.length + 2,
            pos + this.src.length + 2
          );
          tr = tr.setSelection(textSelection);
          this.view.dispatch(tr);
          // focus the editor
          this.view.focus();
        },
        validURL(str) {
          var pattern = new RegExp(
            "^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
              "(\\#[-a-z\\d_]*)?$",
            "i"
          ); // fragment locator
          return !!pattern.test(str);
        }
      },
      template: `
        <div>
          <div v-if="embeds.data">
            <iframe :src="embeds.data.iframeUrl"></iframe>
            <input type="text" v-model="caption" :disabled="!view.editable" placeholder="write caption (optional)" />
          </div>
          <div v-else-if="embeds.data && embeds.data.type === 'link'">
            <div>{{ embeds.data.title }}</div>
            <div>{{ embeds.data.description }}</div>
            <img :src="embeds.data.thumnailUrl" />
          </div>
          <div class="embed-input" v-else>
            <div v-if="embeds.isLoading">Embeding...</div>
            <i class="embed-link-icon"></i>
            <input ref="embedInput" placeholder="Paste or type a link" @paste.stop type="text" v-model="src" :disabled="!view.editable" />
            <button @click="onClickAdd">Add</button>
          </div>
        </div>
      `
    };
  }
}
