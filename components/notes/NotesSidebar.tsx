'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Plus,
  FileText,
  Folder,
  FolderOpen,
  ChevronRight,
  Archive,
  Trash2,
  MoreHorizontal,
  FolderX,
} from 'lucide-react'
import { createClient } from '@/utils/client'
import { createNote } from '@/actions/notes'
import { createFolder, deleteFolder, type DeleteFolderMode } from '@/actions/folders'
import { useToast } from '@/components/ui/Toast'

type FolderRow = { id: string; name: string; parent_id: string | null }

type FolderNode = FolderRow & { children: FolderNode[] }

function buildFolderTree(rows: FolderRow[]): FolderNode[] {
  const byId = new Map<string, FolderNode>()
  rows.forEach((r) => byId.set(r.id, { ...r, children: [] }))

  const roots: FolderNode[] = []
  byId.forEach((node) => {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  const sortRecursive = (nodes: FolderNode[]) => {
    nodes.sort((a, b) => a.name.localeCompare(b.name))
    nodes.forEach((n) => sortRecursive(n.children))
  }
  sortRecursive(roots)
  return roots
}

// A folder + all of its nested subfolder ids (so we can drop them from local
// state after a recursive delete).
function collectFolderIds(rows: FolderRow[], rootId: string): string[] {
  const ids = [rootId]
  const stack = [rootId]
  while (stack.length > 0) {
    const id = stack.pop() as string
    for (const r of rows) {
      if (r.parent_id === id) {
        ids.push(r.id)
        stack.push(r.id)
      }
    }
  }
  return ids
}

export default function NotesSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [folders, setFolders] = useState<FolderRow[]>([])
  const [trashCount, setTrashCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const [creatingFor, setCreatingFor] = useState<string | 'root' | null>(null)
  const [newName, setNewName] = useState('')

  // The folder pending deletion (shows the options dialog), or null.
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    async function load() {
      const [foldersRes, trashRes] = await Promise.all([
        supabase.from('folders').select('id, name, parent_id').order('name'),

        supabase
          .from('notes')
          .select('id', { count: 'exact', head: true })
          .not('deleted_at', 'is', null),
      ])

      if (cancelled) return

      if (foldersRes.data) setFolders(foldersRes.data as FolderRow[])
      if (typeof trashRes.count === 'number') setTrashCount(trashRes.count)
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [pathname, searchParams])

  const tree = buildFolderTree(folders)

  const activeFolder = searchParams.get('folder')
  const activeTag = searchParams.get('tag')
  const onAllNotes = pathname === '/notes' && !activeFolder && !activeTag
  const onArchive = pathname === '/archive'
  const onTrash = pathname === '/trash'

  function toggleExpanded(id: string) {

    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function startSubfolder(parentId: string) {
    setCreatingFor(parentId)
    setNewName('')
    setExpanded((prev) => ({ ...prev, [parentId]: true }))
  }

  function startRootFolder() {
    setCreatingFor('root')
    setNewName('')
  }

  function cancelCreate() {
    setCreatingFor(null)
    setNewName('')
  }

  async function commitCreate() {
    const trimmed = newName.trim()
    if (!trimmed || creatingFor === null) {
      cancelCreate()
      return
    }
    const parentId = creatingFor === 'root' ? null : creatingFor

    const res = await createFolder(trimmed, parentId)
    if (!res.ok) {
      console.error('createFolder failed:', res.error)
      cancelCreate()
      return
    }

    setFolders((prev) => [
      ...prev,
      { id: res.data.id, name: trimmed, parent_id: parentId },
    ])
    cancelCreate()
  }

  async function handleDeleteFolder(mode: DeleteFolderMode) {
    if (!deleting) return
    const removedIds = collectFolderIds(folders, deleting.id)
    const res = await deleteFolder(deleting.id, mode)
    setDeleting(null)
    if (!res.ok) {
      console.error('deleteFolder failed:', res.error)
      toast.error("Couldn't delete that folder. Please try again.")
      return
    }
    // Drop the deleted folder + subfolders from the tree locally.
    setFolders((prev) => prev.filter((f) => !removedIds.includes(f.id)))
    // If we were viewing one of the deleted folders, go back to All notes.
    if (activeFolder && removedIds.includes(activeFolder)) router.push('/notes')
    router.refresh()
  }

  return (
    <div className="flex h-full flex-col bg-sidebar">

      <div className="flex h-14 shrink-0 items-center px-4 border-b border-sidebar-border">
        <span className="text-[13px] font-semibold text-sidebar-foreground tracking-tight">
          Notes
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">

        <div className="space-y-0.5">
          <SidebarLink
            icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.75} />}
            label="All notes"
            active={onAllNotes}
            onClick={() => router.push('/notes')}
          />
        </div>

        <div>
          <div className="flex items-center justify-between px-3 mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Folders
            </span>
            <PlusMenu
              title="New note or folder"
              onNewNote={() => createNote()}
              onNewFolder={startRootFolder}
            />
          </div>

          <SidebarLink
            icon={<Folder className="h-3.5 w-3.5" strokeWidth={1.75} />}
            label="Unorganised"
            active={activeFolder === 'none'}
            onClick={() => router.push('/notes?folder=none')}
          />

          {loading ? (
            <p className="px-3 text-[11px] text-muted-foreground">Loading...</p>
          ) : tree.length === 0 && creatingFor !== 'root' ? (
            <p className="px-3 text-[11px] text-muted-foreground">No folders yet</p>
          ) : (
            <div className="space-y-0.5">
              {tree.map((node) => (
                <FolderItem
                  key={node.id}
                  node={node}
                  depth={0}
                  expanded={expanded}
                  activeFolder={activeFolder}
                  creatingFor={creatingFor}
                  newName={newName}
                  onNewNameChange={setNewName}
                  onCommitCreate={commitCreate}
                  onCancelCreate={cancelCreate}
                  onToggleExpand={toggleExpanded}
                  onSelect={(id) => router.push(`/notes?folder=${id}`)}
                  onAddSubfolder={startSubfolder}
                  onRequestDelete={(id, name) => setDeleting({ id, name })}
                />
              ))}

              {creatingFor === 'root' && (
                <NewFolderInput
                  depth={0}
                  value={newName}
                  onChange={setNewName}
                  onCommit={commitCreate}
                  onCancel={cancelCreate}
                />
              )}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-sidebar-border/50 space-y-0.5">
          <SidebarLink
            icon={<Archive className="h-3.5 w-3.5" strokeWidth={1.75} />}
            label="Archive"
            active={onArchive}
            onClick={() => router.push('/archive')}
          />
          <SidebarLink
            icon={<Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />}
            label="Trash"
            active={onTrash}
            onClick={() => router.push('/trash')}
            trailing={
              trashCount > 0 ? (
                <span className="text-[10px] font-mono text-muted-foreground bg-sidebar-accent rounded px-1.5 py-0.5">
                  {trashCount}
                </span>
              ) : null
            }
          />
        </div>
      </div>

      {deleting && (
        <DeleteFolderDialog
          folder={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDeleteFolder}
        />
      )}
    </div>
  )
}

function SidebarLink({
  icon,
  label,
  active,
  onClick,
  trailing,
}: {
  icon: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
  trailing?: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full group flex items-center gap-2 rounded-md px-3 py-1.5 text-xs transition-colors
        ${
          active
            ? 'bg-accent/10 text-accent font-medium'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
        }
      `}
    >
      <span
        className={
          active
            ? 'text-accent'
            : 'text-muted-foreground group-hover:text-sidebar-accent-foreground'
        }
      >
        {icon}
      </span>
      <span className="flex-1 text-left truncate">{label}</span>
      {trailing}
    </button>
  )
}

function FolderItem({
  node,
  depth,
  expanded,
  activeFolder,
  creatingFor,
  newName,
  onNewNameChange,
  onCommitCreate,
  onCancelCreate,
  onToggleExpand,
  onSelect,
  onAddSubfolder,
  onRequestDelete,
}: {
  node: FolderNode
  depth: number
  expanded: Record<string, boolean>
  activeFolder: string | null
  creatingFor: string | 'root' | null
  newName: string
  onNewNameChange: (v: string) => void
  onCommitCreate: () => void
  onCancelCreate: () => void
  onToggleExpand: (id: string) => void
  onSelect: (id: string) => void
  onAddSubfolder: (parentId: string) => void
  onRequestDelete: (id: string, name: string) => void
}) {
  const hasChildren = node.children.length > 0
  const isOpen = !!expanded[node.id]
  const isActive = activeFolder === node.id

  const showChildren = (isOpen && hasChildren) || creatingFor === node.id

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1 rounded-md pr-1 text-xs transition-colors
          ${
            isActive
              ? 'bg-accent/10 text-accent font-medium'
              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          }
        `}

        style={{ paddingLeft: `${depth * 12 + 4}px` }}
      >

        <button
          onClick={() => hasChildren && onToggleExpand(node.id)}
          className={`p-1 rounded transition-colors ${
            hasChildren ? 'hover:bg-sidebar-accent text-muted-foreground' : 'invisible'
          }`}
          aria-label={isOpen ? 'Collapse folder' : 'Expand folder'}
        >
          <ChevronRight
            className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            strokeWidth={2}
          />
        </button>

        <button
          onClick={() => onSelect(node.id)}
          className="flex-1 flex items-center gap-2 py-1.5 text-left truncate"
        >
          {isOpen && hasChildren ? (
            <FolderOpen
              className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground'}`}
              strokeWidth={1.75}
            />
          ) : (
            <Folder
              className={`h-3.5 w-3.5 shrink-0 ${isActive ? 'text-accent' : 'text-muted-foreground'}`}
              strokeWidth={1.75}
            />
          )}
          <span className="truncate">{node.name}</span>
        </button>

        <PlusMenu
          title="New note or subfolder"
          triggerClassName="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
          onNewNote={() => createNote(node.id)}
          onNewFolder={() => onAddSubfolder(node.id)}
        />
        <FolderMenu onDelete={() => onRequestDelete(node.id, node.name)} />
      </div>

      {showChildren && (
        <div className="space-y-0.5 mt-0.5">
          {isOpen &&
            node.children.map((child) => (
              <FolderItem
                key={child.id}
                node={child}
                depth={depth + 1}
                expanded={expanded}
                activeFolder={activeFolder}
                creatingFor={creatingFor}
                newName={newName}
                onNewNameChange={onNewNameChange}
                onCommitCreate={onCommitCreate}
                onCancelCreate={onCancelCreate}
                onToggleExpand={onToggleExpand}
                onSelect={onSelect}
                onAddSubfolder={onAddSubfolder}
                onRequestDelete={onRequestDelete}
              />
            ))}
          {creatingFor === node.id && (
            <NewFolderInput
              depth={depth + 1}
              value={newName}
              onChange={onNewNameChange}
              onCommit={onCommitCreate}
              onCancel={onCancelCreate}
            />
          )}
        </div>
      )}
    </div>
  )
}

function PlusMenu({
  onNewNote,
  onNewFolder,
  title,
  triggerClassName,
}: {
  onNewNote: () => void
  onNewFolder: () => void
  title: string
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title={title}
        className={
          triggerClassName ??
          'p-0.5 rounded text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors'
        }
      >
        <Plus className="h-3 w-3" strokeWidth={2} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div className="absolute right-0 z-20 mt-1 min-w-32 bg-card border border-border rounded-lg shadow-lg p-1">
            <PlusMenuItem
              icon={<FileText className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="New note"
              onClick={() => {
                setOpen(false)
                onNewNote()
              }}
            />
            <PlusMenuItem
              icon={<Folder className="h-3.5 w-3.5" strokeWidth={1.75} />}
              label="New folder"
              onClick={() => {
                setOpen(false)
                onNewFolder()
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

function PlusMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left"
    >
      <span className="text-muted-foreground">{icon}</span>
      {label}
    </button>
  )
}

function NewFolderInput({
  depth,
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  depth: number
  value: string
  onChange: (v: string) => void
  onCommit: () => void
  onCancel: () => void
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-md pr-2"
      style={{ paddingLeft: `${depth * 12 + 4}px` }}
    >

      <span className="p-1 invisible">
        <ChevronRight className="h-3 w-3" strokeWidth={2} />
      </span>
      <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {

          if (e.key === 'Enter') onCommit()
          if (e.key === 'Escape') onCancel()
        }}
        onBlur={onCommit}
        placeholder="Folder name"
        className="flex-1 bg-transparent outline-none text-xs py-1.5 text-sidebar-foreground placeholder:text-muted-foreground min-w-0"
      />
    </div>
  )
}

// The "⋯" menu on a folder row — just a Delete entry for now.
function FolderMenu({ onDelete }: { onDelete: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        title="Folder options"
        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all"
      >
        <MoreHorizontal className="h-3 w-3" strokeWidth={2} />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
          />
          <div className="absolute right-0 z-20 mt-1 min-w-36 bg-card border border-border rounded-lg shadow-lg p-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                setOpen(false)
                onDelete()
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              Delete folder
            </button>
          </div>
        </>
      )}
    </div>
  )
}

// Confirm dialog with the three "what happens to the notes" choices. Ordered
// safest-first; the destructive (Trash) option is last and red.
function DeleteFolderDialog({
  folder,
  onCancel,
  onConfirm,
}: {
  folder: { id: string; name: string }
  onCancel: () => void
  onConfirm: (mode: DeleteFolderMode) => void | Promise<void>
}) {
  const [busy, setBusy] = useState(false)

  const run = (mode: DeleteFolderMode) => async () => {
    setBusy(true)
    await onConfirm(mode)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/40" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
            <FolderX className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Delete &ldquo;{folder.name}&rdquo;?</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Any subfolders are deleted too. Choose what happens to the notes inside.
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <OptionRow
            title="Keep the notes"
            desc="Move them to Unorganised."
            onClick={run('unorganise')}
            disabled={busy}
          />
          <OptionRow
            title="Archive the notes"
            desc="Move them to the Archive."
            onClick={run('archive')}
            disabled={busy}
          />
          <OptionRow
            title="Move notes to Trash"
            desc="Recoverable for 7 days, then auto-deleted."
            danger
            onClick={run('trash')}
            disabled={busy}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onCancel}
            disabled={busy}
            className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function OptionRow({
  title,
  desc,
  onClick,
  danger,
  disabled,
}: {
  title: string
  desc: string
  onClick: () => void
  danger?: boolean
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg border p-3 text-left transition-colors disabled:opacity-50 ${
        danger ? 'border-red-500/30 hover:bg-red-500/10' : 'border-border hover:bg-sidebar-accent'
      }`}
    >
      <p className={`text-sm font-medium ${danger ? 'text-red-500' : 'text-foreground'}`}>{title}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{desc}</p>
    </button>
  )
}
