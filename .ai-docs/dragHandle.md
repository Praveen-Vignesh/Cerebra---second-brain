# Drag Handle extension

Have you ever wanted to drag nodes around your editor? Well, we did too—so here's an extension for that.

The `DragHandle` extension allows you to easily handle dragging nodes around in the editor. You can define custom render functions, placement, and more.

## [](#install)Install

```
npm install @tiptap/extension-drag-handle
```

## [](#settings)Settings

### [](#render)render

Renders an element that is positioned with the floating-ui/dom package. This is the element that will be displayed as the handle when dragging a node around.

```
DragHandle.configure({
  render: () => {
    const element = document.createElement('div')

    // Use as a hook for CSS to insert an icon
    element.classList.add('custom-drag-handle')

    return element
  },
})
```

### [](#computepositionconfig)computePositionConfig

Configuration for position computation of the drag handle using the floating-ui/dom package. You can pass any options that are available in the [floating-ui documentation](https://floating-ui.com/docs/computePosition).

Default: `{ placement: 'left-start', strategy: 'absolute' }`

```
DragHandle.configure({
  computePositionConfig: {
    placement: 'left',
    strategy: 'fixed',
  },
})
```

### [](#getreferencedvirtualelement)getReferencedVirtualElement

A function that returns the virtual element for the drag handle. This is useful when the menu needs to be positioned relative to a specific DOM element.

Default: `undefined`

```
DragHandle.configure({
  getReferencedVirtualElement: () => {
    // Return a virtual element for custom positioning
    return null
  },
})
```

### [](#locked)locked

Locks the draghandle in place and visibility. If the drag handle was visible, it will remain visible until unlocked. If it was hidden, it will remain hidden until unlocked.

Default: `false`

```
DragHandle.configure({
  locked: true,
})
```

### [](#onnodechange)onNodeChange

Returns a node or null when a node is hovered over. This can be used to highlight the node that is currently hovered over.

Default: `undefined`

```
DragHandle.configure({
  onNodeChange: ({ node, editor, pos }) => {
    if (!node) {
      selectedNode = null
      return
    }
    // Do something with the node
    selectedNode = node
  },
})
```

### [](#nested)nested

Enable drag handles for nested content such as list items, blockquotes, and other nested structures.

When enabled, the drag handle will appear for nested blocks, not just top-level blocks. A rule-based scoring system determines which node to target based on cursor position and configured rules.

Default: `false`

```
// Enable with defaults
DragHandle.configure({
  nested: true,
})

// Enable with custom edge detection
DragHandle.configure({
  nested: {
    edgeDetection: {
      threshold: 20,
    },
  },
})
```

See the [Nested Drag Handle](#nested-drag-handle) section below for detailed configuration options.

## [](#commands)Commands

### [](#lockdraghandle)lockDragHandle()

Locks the draghandle in place and visibility. If the drag handle was visible, it will remain visible until unlocked. If it was hidden, it will remain hidden until unlocked.

This can be useful if you want to have a menu inside of the drag handle and want it to remain visible whether the drag handle is moused over or not.

```
editor.commands.lockDragHandle()
```

### [](#unlockdraghandle)unlockDragHandle()

Unlocks the draghandle. Resets to default visibility and behavior.

```
editor.commands.unlockDragHandle()
```

### [](#toggledraghandle)toggleDragHandle()

Toggle draghandle lock state. If the drag handle is locked, it will be unlocked and vice versa.

```
editor.commands.toggleDragHandle()
```

## [](#nested-drag-handle)Nested Drag Handle

By default, the drag handle only appears for top-level blocks. When `nested` is enabled, it also works with nested content like list items, blockquote paragraphs, and other nested structures.

### [](#basic-usage)Basic Usage

```
// Enable with all defaults
DragHandle.configure({
  nested: true,
})
```

### [](#configuration-options)Configuration Options

When you need more control, pass an options object:

```
DragHandle.configure({
  nested: {
    // Edge detection configuration
    edgeDetection: 'left', // or 'right', 'both', 'none', or custom config

    // Custom rules for node selection
    rules: [],

    // Whether to use default rules
    defaultRules: true,

    // Restrict to specific container types
    allowedContainers: ['bulletList', 'orderedList'],
  },
})
```

### [](#edge-detection)Edge Detection

Edge detection controls when to prefer the parent node over a nested node. When the cursor is near an edge of the content area, you often want to select the parent container rather than its nested content.

#### [](#presets)Presets

```
DragHandle.configure({
  nested: {
    // 'left' (default) - Prefer parent near left/top edges
    edgeDetection: 'left',

    // 'right' - Prefer parent near right/top edges (for RTL layouts)
    edgeDetection: 'right',

    // 'both' - Prefer parent near any horizontal edge
    edgeDetection: 'both',

    // 'none' - Disable edge detection entirely
    edgeDetection: 'none',
  },
})
```

#### [](#custom-configuration)Custom Configuration

For fine-tuned control, pass a configuration object:

```
DragHandle.configure({
  nested: {
    edgeDetection: {
      // Which edges trigger parent preference
      edges: ['left', 'top'],

      // Distance in pixels from edge to trigger (default: 12)
      threshold: 20,

      // How strongly to prefer parent (default: 500)
      strength: 500,
    },
  },
})
```

You can also pass a partial configuration to override specific values while keeping defaults:

```
DragHandle.configure({
  nested: {
    // Only override threshold, keep default edges and strength
    edgeDetection: { threshold: -16 },
  },
})
```

#### [](#how-strength-works)How Strength Works

The `strength` value controls how aggressively the system prefers parent nodes when the cursor is near an edge. It works together with the scoring system:

1.  Each candidate node starts with a base score of **1000**
2.  When the cursor is near a configured edge, a deduction is calculated as: `strength × depth`
3.  The node with the highest remaining score is selected

With the default strength of **500**:

Node Depth

Deduction

Remaining Score

Effect

1 (shallow)

500

500

Still selectable, but deprioritized

2

1000

0

Barely selectable, loses to non-edge nodes

3+ (deep)

1500+

negative

Effectively excluded

This means deeper nested nodes are more aggressively deprioritized near edges, making it easier to select their parent containers.

**Examples:**

-   `strength: 250` - Gentler preference; even depth-3 nodes remain somewhat selectable near edges
-   `strength: 500` - Default; depth-2+ nodes are strongly deprioritized near edges
-   `strength: 1000` - Aggressive; any nested node near an edge is effectively excluded

### Negative Threshold Values

Using a negative threshold value (e.g., `-16`) effectively reduces the area where edge detection triggers, making it easier to select nested items even when the cursor is near the edge. The cursor must be further inside the element before edge detection activates.

### [](#allowed-containers)Allowed Containers

Restrict nested drag handles to specific container types:

```
DragHandle.configure({
  nested: {
    // Only enable nested dragging inside lists
    allowedContainers: ['bulletList', 'orderedList'],
  },
})
```

When set, the drag handle will only appear for nested content inside the specified container types. Top-level blocks are always draggable regardless of this setting.

### [](#custom-rules)Custom Rules

The drag handle uses a scoring system to determine which node to select. Each candidate node starts with a score of 1000, and rules modify this score. The node with the highest final score is selected.

#### [](#creating-custom-rules)Creating Custom Rules

```
DragHandle.configure({
  nested: {
    rules: [
      {
        id: 'preferParagraphs',
        evaluate: ({ node, parent, depth }) => {
          // Return a score modifier:
          // - Negative: Boost the node's score (more likely to be selected)
          // - 0: No change, node remains at current score
          // - 1-999: Deduction, node is less preferred
          // - >= 1000: Node is effectively excluded

          if (node.type.name === 'paragraph') {
            return -200 // Boost paragraphs by 200 points
          }
          return 100 // Small penalty for other nodes
        },
      },
    ],
  },
})
```

#### [](#score-modifiers-explained)Score Modifiers Explained

Return Value

Effect

Example Use Case

`-500`

Boost score by 500

Strongly prefer this node type

`-100`

Boost score by 100

Slightly prefer this node

`0`

No change

Node is neutral

`100`

Reduce score by 100

Slightly deprioritize

`500`

Reduce score by 500

Strongly deprioritize

`1000+`

Effectively exclude

Never select this node

Since all nodes start at 1000, a node with a -200 boost ends up at 1200, while a node with a 100 penalty ends up at 900. The node with 1200 wins.

#### [](#rule-context)Rule Context

Each rule receives a context object with the following properties:

Property

Type

Description

`node`

`Node`

The node being evaluated

`pos`

`number`

Absolute position in the document

`depth`

`number`

Depth in the document tree (0 = doc root)

`parent`

`Node | null`

Parent node (null if this is the doc)

`index`

`number`

Index among siblings (0-based)

`isFirst`

`boolean`

True if this is the first child

`isLast`

`boolean`

True if this is the last child

`$pos`

`ResolvedPos`

Resolved position for advanced queries

`view`

`EditorView`

Editor view for DOM access

#### [](#example-custom-question-block)Example: Custom Question Block

If you have a custom question block with alternatives, you might want to only allow dragging the alternatives:

```
DragHandle.configure({
  nested: {
    rules: [
      {
        id: 'onlyAlternatives',
        evaluate: ({ node, parent }) => {
          // Inside a question, only alternatives should be draggable
          if (parent?.type.name === 'question') {
            return node.type.name === 'alternative' ? 0 : 1000
          }
          return 0
        },
      },
    ],
  },
})
```

#### [](#building-custom-list-like-nodes)Building Custom List-Like Nodes

If you create a custom node that behaves like a list (a wrapper containing draggable child items), the drag handle needs guidance to prioritize the child items over the wrapper. Without this, users may find it difficult to target individual items.

The default rules automatically deprioritize any node whose first child is a `listItem` or `taskItem`. For custom list-like structures with different node names, you have two options:

**Option 1: Name your item nodes `listItem` or `taskItem`**

If your custom items extend or behave like standard list items, consider using the same type name. The default rules will handle them automatically.

**Option 2: Add a custom rule to deprioritize the wrapper**

For custom node names, add a rule that deducts points from the wrapper:

```
DragHandle.configure({
  nested: {
    rules: [
      {
        id: 'deprioritizeCustomListWrapper',
        evaluate: ({ node }) => {
          // Deprioritize the wrapper so child items are easier to select
          if (node.type.name === 'myCustomList') {
            return 900
          }
          return 0
        },
      },
    ],
  },
})
```

**Styling considerations for custom list-like nodes:**

Custom list wrappers benefit from adequate padding or margins to give edge detection room to function. This allows users to target the wrapper itself when needed (by moving the cursor to the edge) while still making it easy to select individual items in the main content area.

```
.my-custom-list {
  /* Provide space for edge detection to distinguish wrapper from items */
  padding: 0.5rem;
}

.my-custom-list-item {
  /* Space between items for easier targeting */
  margin: 0.25rem 0;
  padding-left: 0.5rem;
}
```

#### [](#disabling-default-rules)Disabling Default Rules

If you want complete control over node selection, disable the default rules:

```
DragHandle.configure({
  nested: {
    defaultRules: false,
    rules: [
      // Your custom rules here
    ],
  },
})
```

### Default Rules

The default rules handle common cases like excluding inline content and handling list items correctly. Only disable them if you have specific requirements and understand the implications.

### [](#styling-considerations)Styling Considerations

For nested drag handles to work well, your editor styles may need adjustments. The drag handle needs physical space to appear, and the edge detection threshold needs room to function.

#### [](#add-left-margin-or-padding)Add Left Margin or Padding

The drag handle is positioned to the left of content. Without sufficient margin, it may overlap with text or appear outside the visible area:

```
.ProseMirror {
  /* Leave space for the drag handle on the left */
  padding-left: 2rem;
}

/* Or use margin on direct children */
.ProseMirror > * {
  margin-left: 2rem;
}
```

#### [](#nested-content-spacing)Nested Content Spacing

For nested elements like list items, ensure there's enough indentation for the drag handle to appear at each nesting level:

```
.ProseMirror ul,
.ProseMirror ol {
  /* Provide space for nested drag handles */
  padding-left: 1.5rem;
}

.ProseMirror li {
  /* Additional spacing if needed */
  margin-left: 0.5rem;
}
```

#### [](#edge-detection-and-threshold)Edge Detection and Threshold

The `threshold` value in edge detection is measured in pixels from the element's edge. If your content has no padding, a threshold of 12px means the cursor must be within 12px of the actual text. Adding padding to your content areas makes edge detection feel more natural:

```
.ProseMirror blockquote {
  /* Padding gives the edge detection room to breathe */
  padding: 0.5rem 1rem;
}

.ProseMirror li > p {
  /* Even small padding helps with edge detection */
  padding-left: 0.25rem;
}
```

#### [](#example-complete-nested-drag-handle-styles)Example: Complete Nested Drag Handle Styles

```
.ProseMirror {
  /* Base padding for drag handle space */
  padding: 1rem 1rem 1rem 3rem;
}

.ProseMirror > * {
  /* Consistent left margin for top-level blocks */
  margin-left: 0;
}

.ProseMirror ul,
.ProseMirror ol {
  /* List indentation */
  padding-left: 1.5rem;
}

.ProseMirror li {
  /* Space between list marker and content */
  padding-left: 0.25rem;
}

.ProseMirror blockquote {
  /* Blockquote padding for comfortable dragging */
  padding: 0.5rem 1rem;
  margin-left: 0;
  border-left: 3px solid #ccc;
}

/* Selection highlight for dragged nodes */
.ProseMirror-selectednode,
.ProseMirror-selectednoderange {
  position: relative;
}

.ProseMirror-selectednode::before,
.ProseMirror-selectednoderange::before {
  content: '';
  position: absolute;
  inset: -0.25rem;
  background-color: rgba(112, 207, 248, 0.3);
  border-radius: 0.2rem;
  pointer-events: none;
  z-index: -1;
}
```

### Negative Thresholds

If adding padding is not possible, you can use a negative `threshold` value (e.g., `-16`) to reduce the edge detection area. This makes the system less likely to prefer parent nodes, allowing nested items to be selected even when the cursor is near the edge.



'''
import './styles.scss'

import DragHandle from '@tiptap/extension-drag-handle-react'
import Image from '@tiptap/extension-image'
import { TableKit } from '@tiptap/extension-table'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, useState } from 'react'

const NESTED_CONFIG_LTR = { edgeDetection: { threshold: -16, edges: ['left'] } }
const NESTED_CONFIG_RTL = { edgeDetection: { threshold: -16, edges: ['right'] } }

export default () => {
  const [nested, setNested] = useState(true)
  const [rtl, setRtl] = useState(false)

  const editor = useEditor({
    extensions: [StarterKit, Image.configure({ inline: false }), TableKit],
    content: `
      <h1>The Complete Guide to Modern Web Development</h1>
      <p>Web development has evolved significantly over the past decade. What once required multiple tools and complex setups can now be accomplished with modern frameworks and libraries that prioritize developer experience.</p>

        <img src="https://unsplash.it/500/500" alt="Random Image" />

        <p dir="rtl">تجربة سحب هذا النص توضح كيف يجب أن يلتصق شبح السحب بالمؤشر حتى داخل المحتوى من اليمين إلى اليسار.</p>

        <h2>Getting Started</h2>
      <p>Before diving into the technical details, it's important to understand the foundational concepts that make modern web development possible.</p>

      <blockquote>
        <p>"The best code is no code at all. Every new line of code you willingly bring into the world is code that has to be debugged, code that has to be read and understood." - Jeff Atwood</p>
      </blockquote>

      <p>This philosophy guides much of modern development practices, emphasizing simplicity and maintainability over complexity.</p>

      <table>
        <thead>
          <tr>
            <th>Feature</th>
            <th>Description</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Component-Based Architecture</td>
            <td>Breaks down the UI into reusable components.</td>
            <td><code>&lt;MyComponent /&gt;</code></td>
          </tr>
          <tr>
            <td>Virtual DOM</td>
            <td>Improves performance by minimizing direct DOM manipulation.</td>
            <td><code>&lt;VirtualDOMComponent /&gt;</code></td>
          </tr>
        </tbody>
      </table>

      <hr>

      <h2>Key Technologies</h2>
      <p>Here are the essential technologies every web developer should be familiar with:</p>

      <ul>
        <li>HTML5 and semantic markup</li>
        <li>CSS3 with modern layout techniques
          <ul>
            <li>Flexbox for one-dimensional layouts</li>
            <li>Grid for two-dimensional layouts</li>
            <li>Custom properties (CSS variables)</li>
          </ul>
        </li>
        <li>JavaScript (ES6+)</li>
        <li>TypeScript for type safety</li>
      </ul>

      <h3>Framework Comparison</h3>
      <p>Choosing the right framework depends on your project requirements:</p>

      <ol>
        <li>React - Component-based UI library</li>
        <li>Vue - Progressive framework</li>
        <li>Angular - Full-featured platform</li>
        <li>Svelte - Compile-time framework</li>
      </ol>

      <hr>

      <h2>Best Practices</h2>
      <p>Following established best practices ensures your code remains maintainable and scalable.</p>

      <blockquote>
        <p>Always write code as if the person who ends up maintaining it is a violent psychopath who knows where you live.</p>
      </blockquote>

      <h3>Code Organization</h3>
      <p>A well-organized codebase is crucial for long-term project success. Consider these principles:</p>

      <ul>
        <li>Separation of concerns</li>
        <li>DRY (Don't Repeat Yourself)</li>
        <li>KISS (Keep It Simple, Stupid)</li>
      </ul>

      <p>By following these guidelines, you'll create applications that are easier to maintain, test, and extend over time.</p>
    `,
  })

  const isEditable = useEditorState({
    editor,
    selector: context => {
      return context.editor.isEditable
    },
  })

  const toggleEditable = () => {
    editor.setEditable(!editor.isEditable)
    editor.view.dispatch(editor.view.state.tr)
  }

  const toggleNested = () => {
    setNested(!nested)
  }

  const toggleRtl = () => {
    setRtl(!rtl)
  }

  let nestedConfig = false

  if (nested) {
    nestedConfig = rtl ? NESTED_CONFIG_RTL : NESTED_CONFIG_LTR
  }

  const computePositionConfig = { placement: rtl ? 'right-start' : 'left-start' }

  useEffect(() => {
    if (!editor) {
      return
    }

    if (rtl) {
      editor.view.dom.setAttribute('dir', 'rtl')
    } else {
      editor.view.dom.removeAttribute('dir')
    }
  }, [editor, rtl])

  return (
    <>
      <div className="control-group">
        <div className="button-group">
          <button className={isEditable ? 'is-active' : ''} onClick={toggleEditable}>
            Toggle editable
          </button>
          <button className={nested ? 'is-active' : ''} onClick={toggleNested}>
            Toggle nested drag handle
          </button>
          <button className={rtl ? 'is-active' : ''} onClick={toggleRtl}>
            Toggle RTL editor
          </button>
        </div>
      </div>
      <DragHandle editor={editor} nested={nestedConfig} computePositionConfig={computePositionConfig}>
        <div className="custom-drag-handle" />
      </DragHandle>
      <EditorContent editor={editor} />
    </>
  )
}'''



::selection {
  background-color: #70cff850;
}

.ProseMirror {
  padding: 1rem 1rem 1rem 0;

  * {
    margin-top: 0.75em;
  }

  > * {
    margin-inline-start: 3rem;
  }

  .ProseMirror-widget * {
    margin-top: auto;
  }

  ul,
  ol {
    padding-inline: 1rem;
  }
}

.ProseMirror-noderangeselection {
  *::selection {
    background: transparent;
  }

  * {
    caret-color: transparent;
  }
}

.ProseMirror-selectednode,
.ProseMirror-selectednoderange {
  position: relative;

  &::before {
    position: absolute;
    pointer-events: none;
    z-index: -1;
    content: '';
    top: -0.25rem;
    left: -0.25rem;
    right: -0.25rem;
    bottom: -0.25rem;
    background-color: #70cff850;
    border-radius: 0.2rem;
  }
}

.custom-drag-handle {
  &::after {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1.25rem;
    content: '⠿';
    font-weight: 700;
    cursor: grab;
    background: #0d0d0d10;
    color: #0d0d0d50;
    border-radius: 0.25rem;
  }
}