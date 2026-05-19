# Details extension

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

## [](#install)Install

```
npm install @tiptap/extension-details
```

This extension requires the [`DetailsSummary`](/docs/editor/extensions/nodes/details-summary) and [`DetailsContent`](/docs/editor/extensions/nodes/details-content) node.

## [](#settings)Settings

### [](#persist)persist

Specify if the open status should be saved in the document. Defaults to `false`.

```
Details.configure({
  persist: true,
})
```

### [](#openclassname)openClassName

Specifies a CSS class that is set when toggling the content. Defaults to `is-open`.

```
Details.configure({
  openClassName: 'is-open',
})
```

### [](#rendertogglebutton)renderToggleButton

Customize the button that toggles a details node. The callback receives the button `element`, the current `isOpen` state, and the `node` that should be used to derive the label.

This is useful when you want to change the button's accessible label or update the button element directly.

```
Details.configure({
  renderToggleButton: ({ element, isOpen, node }) => {
    element.setAttribute(
      'aria-label',
      isOpen
        ? `Collapse details: ${node.textContent || 'details'}`
        : `Expand details: ${node.textContent || 'details'}`,
    )
  },
})
```

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
Details.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## [](#commands)Commands

### [](#setdetails)setDetails()

Wrap content in a details node.

```
editor.commands.setDetails()
```

### [](#unsetdetails)unsetDetails()

Unwrap a details node.

```
editor.commands.unsetDetails()
```







# DetailsContent extension

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

## [](#install)Install

```
npm install @tiptap/extension-details
```

## [](#usage)Usage

```
import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details'

const editor = new Editor({
  extensions: [Details, DetailsSummary, DetailsContent],
})
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
DetailsContent.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```




# DetailsSummary extension

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

## [](#install)Install

```
npm install @tiptap/extension-details
```

## [](#usage)Usage

```
import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details'

const editor = new Editor({
  extensions: [Details, DetailsSummary, DetailsContent],
})
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
DetailsSummary.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```