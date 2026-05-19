# TableCell extension

Don’t try to use tables without table cells. It won’t be fun.

## [](#install)Install

```
npm install @tiptap/extension-table
```

This extension requires the [`Table`](/docs/editor/extensions/nodes/table) extension to be installed.

This extension is installed by default with the `TableKit` extension, so you don’t need to install it separately.

```
import { Editor } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'

new Editor({
  extensions: [TableKit],
})
```

## [](#source-code)Source code

[packages/extension-table-cell/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/src/cell)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { TableCell } from '@tiptap/extension-table/cell'

new Editor({
  extensions: [TableCell],
})
```





# TableHeader extension

This extension complements the [`Table`](/docs/editor/extensions/nodes/table) extension and adds… you guessed it… table headers to them.

## [](#install)Install

```
npm install @tiptap/extension-table
```

This extension requires the [`Table`](/docs/editor/extensions/nodes/table) extension to be installed.

This extension is installed by default with the `TableKit` extension, so you don’t need to install it separately.

```
import { Editor } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'

new Editor({
  extensions: [TableKit],
})
```

## [](#usage)Usage

Table headers are optional. But come on, you want them, don’t you? If you don’t want them, update the `content` attribute of the [`TableRow`](/docs/editor/extensions/nodes/table-row) extension, like this:

```
// Table rows without table headers
TableRow.extend({
  content: 'tableCell*',
})
```

This is the default, which allows table headers:

```
// Table rows with table headers (default)
TableRow.extend({
  content: '(tableCell | tableHeader)*',
})
```

## [](#source-code)Source code

[packages/extension-table-header/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/src/header)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { TableHeader } from '@tiptap/extension-table/header'

new Editor({
  extensions: [TableHeader],
})
```


# TableRow extension

What’s a table without rows? Add this extension to make your tables usable.

## [](#install)Install

```
npm install @tiptap/extension-table
```

This extension requires the [`Table`](/docs/editor/extensions/nodes/table) extension to be installed.

This extension is installed by default with the `TableKit` extension, so you don’t need to install it separately.

```
import { Editor } from '@tiptap/core'
import { TableKit } from '@tiptap/extension-table'

new Editor({
  extensions: [TableKit],
})
```

## [](#source-code)Source code

[packages/extension-table/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-table/src/row)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { TableRow } from '@tiptap/extension-table/row'

new Editor({
  extensions: [TableRow],
})
```