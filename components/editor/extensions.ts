import StarterKit from "@tiptap/starter-kit"
import Heading from "@tiptap/extension-heading"
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import Typography from '@tiptap/extension-typography'
import Highlight from "@tiptap/extension-highlight"
import Placeholder from "@tiptap/extension-placeholder"
import { TextStyleKit } from '@tiptap/extension-text-style'
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { TableKit } from '@tiptap/extension-table'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import FloatingMenu from '@tiptap/extension-floating-menu'
import { BulletList, ListItem, OrderedList } from '@tiptap/extension-list'


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

  Placeholder.configure({ placeholder: "What's on your mind ?", }),
    
  TableKit.configure({
    table: { resizable: true, HTMLAttributes: { class: "cerebra-table" } },
    tableHeader: { HTMLAttributes: { class: "cerebra-table-header" } },
    tableRow: { HTMLAttributes: { class: "cerebra-table-row" } },
    tableCell: { HTMLAttributes: { class: "cerebra-table-cell" } },
  }),

  Details.configure({
    openClassName: "cerebra-details-isOpen",
    HTMLAttributes: { class: "cerebra-details" }
  }),

  DetailsContent,
  DetailsSummary,

  TextStyleKit.configure({
    fontSize: {
      options: [
        { value: "12px", label: "Small" },
        { value: "16px", label: "Medium" },
        { value: "20px", label: "Large" }
      ]
    },

  }),

  Typography.configure({
    types: ['paragraph', 'heading'],
    HTMLAttributes: { class: "cerebra-typography" },
  }),
  BulletList,
  OrderedList,
  ListItem,

  FloatingMenu,

  Highlight.configure({ multicolor: true }),

  TextStyle,
  Color,
  TextAlign.configure({ types: ['paragraph', 'heading', 'listItem'] }),

  Text,

]
