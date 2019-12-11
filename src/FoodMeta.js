import { Node } from "tiptap";

export default class FoodMetaNode extends Node {
  // name of the component
  get name() {
    return "foodMeta";
  }

  get schema() {
    return {
      // here you have to specify all values that can be stored in this node
      attrs: {
        cooktime: {
          default: 0
        },
        serves: {
          default: 0
        }
      },
      group: "block",
      selectable: false,
      // parseDOM and toDOM is still required to make copy and paste work
      parseDOM: [
        {
          tag: `[data-type="${this.name}"]`,
          getAttrs: dom => {
            console.log("Dom", dom);
            return {
              cooktime: parseInt(dom.getAttribute("data-cooktime"), 10),
              serves: parseInt(dom.getAttribute("data-serves"), 10)
            };
          }
        }
      ],
      toDOM: () => [
        "div",
        {
          allowfullscreen: "true",
          class: "abcd"
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
      computed: {
        cooktime: {
          get() {
            return this.node.attrs.cooktime;
          },
          set(cooktime) {
            this.updateAttrs({
              cooktime
            });
          }
        },
        serves: {
          get() {
            return this.node.attrs.serves;
          },
          set(serves) {
            this.updateAttrs({
              serves
            });
          }
        }
      },
      template: `
        <div>
          <label>Cook Time</label>
          <input type="number" v-model="cooktime" />
          <br>
          <label>Serves</label>
          <input type="number" v-model="serves" />
        </div>
      `
    };
  }
}
