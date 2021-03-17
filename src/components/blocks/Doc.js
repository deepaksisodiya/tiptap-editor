import { Node } from "@tiptap/core";

export default Node.create({
  name: "doc",
  topNode: true,
  content: "header featuredimage block+",
});
