import { Node, TextSelection } from "tiptap";
import axios from "axios";
// import { setBlockType } from "tiptap-commands";

export default class EmbedNode extends Node {
  get name() {
    return "embed";
  }

  get defaultOptions() {
    return {
      embedType: "video"
    };
  }

  get schema() {
    return {
      attrs: {
        src: {
          default: null
        },
        caption: {
          default: null
        },
        embedType: {
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
    return attrs => (state, dispatch) => {
      return dispatch(state.tr.replaceSelectionWith(type.create(attrs)));
    };
  }

  get view() {
    return {
      props: ["node", "updateAttrs", "view", "getPos", "options"],
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
        },
        placeholderText() {
          if (this.node.attrs.embedType === "link") {
            return "Paste or type a link";
          }
          return "Paste or type a video";
        },
        loadingText() {
          if (this.node.attrs.embedType === "link") {
            return "Linking video";
          }
          return "Embedding video";
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
              const response = await axios(
                `${this.options.baseUrl}?url=${this.src}`
              );
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
        },
        embedUrl(url, provider) {
          if (provider !== "YouTube") return url;
          return "https://www.youtube.com/embed/" + url.split("=")[1];
        }
      },
      template: `
        <div>
          <div class="embed-input" v-if="embeds.data === null && embeds.isLoading === false">
            <i class="embed-link-icon"></i>
            <input ref="embedInput" :placeholder="placeholderText" @paste.stop type="text" v-model="src" :disabled="!view.editable" />
            <button @click="onClickAdd">Add</button>
          </div>
          <div class="embed-input" v-if="embeds.data === null && embeds.isLoading === true">
            <i class="loading-icon"></i>
            <span>{{ loadingText }}</span>
          </div>
          <div v-if="embeds.data && embeds.data.type === 'video'">
            <iframe :src="embedUrl(embeds.data.url, embeds.data.provider_name)"></iframe>
            <input type="text" v-model="caption" :disabled="!view.editable" placeholder="write caption (optional)" />
          </div>
          <div
            class="embed-link-block"
            :class="{ 'no-image': !embeds.data.thumbnail_url }"
            v-if="embeds.data && embeds.data.type === 'link'"
          >
            <div class="content">
              <h1>{{ embeds.data.title }}</h1>
              <p>{{ embeds.data.description }}</p>
              <span>{{ embeds.data.url }}</span>
            </div>
            <figure v-if="embeds.data.thumbnail_url">
              <img :src="embeds.data.thumbnail_url" alt="Trulli">
            </figure>
          </div>
        </div>
      `
    };
  }
}
