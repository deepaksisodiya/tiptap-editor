import { Selection } from "prosemirror-state";
import { Mark } from "tiptap";
import { toggleMark, markInputRule, markPasteRule } from "tiptap-commands";
import { markIsActive } from "tiptap-utils";

const hasCode = (state, pos) => {
  const { code } = state.schema.marks;
  const node = pos >= 0 && state.doc.nodeAt(pos);
  if (node) {
    return !!node.marks.filter(mark => mark.type === code).length;
  }

  return false;
};

export default class Code extends Mark {
  get name() {
    return "code";
  }

  get schema() {
    return {
      excludes: "_",
      parseDOM: [
        { tag: "span.code", preserveWhitespace: true },
        { tag: "code", preserveWhitespace: true },
        { tag: "tt", preserveWhitespace: true },
        {
          tag: "span",
          preserveWhitespace: true,
          getAttrs: domNode => {
            let dom = domNode;
            if (dom.style.whiteSpace === "pre") {
              return {};
            }
            if (
              dom.style.fontFamily &&
              dom.style.fontFamily.toLowerCase().indexOf("monospace") >= 0
            ) {
              return {};
            }
            return false;
          }
        }
      ],
      toDOM: () => ["code", 0]
    };
  }

  keys({ type }) {
    return {
      "Mod-`": toggleMark(type),
      // Handling ArrowRight and ArrowLeft in case of code mark
      // otherwise at the edges it is impossible to add new text, because the cursor can't move.
      // https://bitbucket.org/atlassian/atlassian-frontend-mirror/src/master/editor/editor-core/src/plugins/text-formatting/commands/text-formatting.ts
      ArrowRight: (state, dispatch) => {
        debugger;
        const { code } = state.schema.marks;
        const { empty, $cursor } = state.selection;
        if (!empty || !$cursor) {
          return false;
        }
        const { storedMarks } = state.tr;
        if (code) {
          const insideCode = markIsActive(state, code.create());
          const currentPosHasCode = state.doc.rangeHasMark(
            $cursor.pos,
            $cursor.pos,
            code
          );
          const nextPosHasCode = state.doc.rangeHasMark(
            $cursor.pos,
            $cursor.pos + 1,
            code
          );

          const exitingCode =
            !currentPosHasCode &&
            !nextPosHasCode &&
            (!storedMarks || !!storedMarks.length);
          const enteringCode =
            !currentPosHasCode &&
            nextPosHasCode &&
            (!storedMarks || !storedMarks.length);

          // entering code mark (from the left edge): don't move the cursor, just add the mark
          if (!insideCode && enteringCode) {
            if (dispatch) {
              dispatch(state.tr.addStoredMark(code.create()));
            }
            return true;
          }

          // exiting code mark: don't move the cursor, just remove the mark
          if (insideCode && exitingCode) {
            if (dispatch) {
              dispatch(state.tr.removeStoredMark(code));
            }
            return true;
          }
        }

        return false;
      },
      ArrowLeft: (state, dispatch) => {
        const { code } = state.schema.marks;
        const { empty, $cursor } = state.selection;
        if (!empty || !$cursor) {
          return false;
        }

        const { storedMarks } = state.tr;
        if (code) {
          const insideCode = code && markIsActive(state, code.create());
          const currentPosHasCode = hasCode(state, $cursor.pos);
          const nextPosHasCode = hasCode(state, $cursor.pos - 1);
          const nextNextPosHasCode = hasCode(state, $cursor.pos - 2);

          const exitingCode =
            currentPosHasCode &&
            !nextPosHasCode &&
            (storedMarks === null ||
              (Array.isArray(storedMarks) && !!storedMarks.length));
          const atLeftEdge =
            nextPosHasCode &&
            !nextNextPosHasCode &&
            (storedMarks === null ||
              (Array.isArray(storedMarks) && !!storedMarks.length));
          const atRightEdge =
            ((exitingCode &&
              Array.isArray(storedMarks) &&
              !storedMarks.length) ||
              (!exitingCode && storedMarks === null)) &&
            !nextPosHasCode &&
            nextNextPosHasCode;
          const enteringCode =
            !currentPosHasCode &&
            nextPosHasCode &&
            Array.isArray(storedMarks) &&
            !storedMarks.length;

          // at the right edge: remove code mark and move the cursor to the left
          if (!insideCode && atRightEdge) {
            const tr = state.tr.setSelection(
              Selection.near(state.doc.resolve($cursor.pos - 1))
            );

            if (dispatch) {
              dispatch(tr.removeStoredMark(code));
            }
            return true;
          }

          // entering code mark (from right edge): don't move the cursor, just add the mark
          if (!insideCode && enteringCode) {
            if (dispatch) {
              dispatch(state.tr.addStoredMark(code.create()));
            }
            return true;
          }

          // at the left edge: add code mark and move the cursor to the left
          if (insideCode && atLeftEdge) {
            const tr = state.tr.setSelection(
              Selection.near(state.doc.resolve($cursor.pos - 1))
            );

            if (dispatch) {
              dispatch(tr.addStoredMark(code.create()));
            }
            return true;
          }

          if (insideCode && exitingCode) {
            if (dispatch) {
              dispatch(state.tr.removeStoredMark(code));
            }
            return true;
          }
        }

        return false;
      }
    };
  }

  commands({ type }) {
    return () => toggleMark(type);
  }

  inputRules({ type }) {
    return [markInputRule(/(?:`)([^`]+)(?:`)$/, type)];
  }

  pasteRules({ type }) {
    return [markPasteRule(/(?:`)([^`]+)(?:`)/g, type)];
  }
}
