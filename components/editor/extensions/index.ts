import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import { Table } from "@tiptap/extension-table"
import TableRow from "@tiptap/extension-table-row"
import TableHeader from "@tiptap/extension-table-header"
import TableCell from "@tiptap/extension-table-cell"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Link from "@tiptap/extension-link"
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { common, createLowlight } from "lowlight"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'

const lowlight = createLowlight(common)

export const getExtensions = () => [
  StarterKit.configure({codeBlock: false}),
  Heading.configure({
    HTMLAttributes: { class: "cerebra-heading" },
  }),

  CodeBlockLowlight.configure({
    lowlight,defaultLanguage: "plaintext",
    HTMLAttributes: {
      class: "cerebra-code-block",
    },
  }),
  
  Image.configure({
    allowBase64: true,
    HTMLAttributes: { class: "cerebra-image" },
  }),
  
  Link.configure({
    openOnClick: true,
    HTMLAttributes: { class: "cerebra-link" },
  }),

  Highlight.configure({ multicolor: false }),

  Placeholder.configure({ placeholder: "Write something, or press '/' for commands…", }),
  
  Table.configure({ resizable: true }),
  TableRow,
  TableHeader,
  TableCell,

  Details.configure({
    openClassName: "cerebra-details-isOpen",
    HTMLAttributes: { class: "cerebra-details" }
  }),

  DetailsContent,
  DetailsSummary,

  Color,
  TextStyle,
]
