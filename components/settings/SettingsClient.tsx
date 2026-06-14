'use client'

import { useState } from 'react'
import { ExternalLink, Check, Trash2 } from 'lucide-react'
import { AI_PROVIDERS, providerInfo, type Provider } from '@/utils/aiProviders'
import { saveAiSettings, clearAiKey, type AiSettings } from '@/actions/settings'
import { useToast } from '@/components/ui/Toast'

// The "bring your own API key" form. Pick a provider + model, paste a key, save.
// The raw key is sent to a server action that encrypts it before storing — it is
// never read back to the browser (we only ever show the last 4 chars).
export default function SettingsClient({ initial }: { initial: AiSettings }) {
  const toast = useToast()
  const [provider, setProvider] = useState<Provider>(initial.provider ?? 'gemini')
  const [model, setModel] = useState<string>(
    initial.model ?? providerInfo(initial.provider ?? 'gemini')?.models[0] ?? ''
  )
  const [apiKey, setApiKey] = useState('')
  const [hasKey, setHasKey] = useState(initial.hasKey)
  const [keyLast4, setKeyLast4] = useState(initial.keyLast4)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)

  const info = providerInfo(provider)

  // Switching provider resets the model to that provider's default (keys are
  // provider-specific, so the existing key won't apply to the new provider).
  function changeProvider(p: Provider) {
    setProvider(p)
    setModel(providerInfo(p)?.models[0] ?? '')
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    const res = await saveAiSettings(provider, model, apiKey)
    setSaving(false)
    if (res.ok) {
      const trimmed = apiKey.trim()
      if (trimmed) {
        setHasKey(true)
        setKeyLast4(trimmed.slice(-4))
      }
      setApiKey('')
      setMessage({ kind: 'ok', text: 'Saved.' })
      toast.success('Settings saved.')
    } else {
      setMessage({ kind: 'err', text: res.error })
      toast.error(res.error || "Couldn't save settings.")
    }
  }

  async function handleClear() {
    setSaving(true)
    setMessage(null)
    const res = await clearAiKey()
    setSaving(false)
    if (res.ok) {
      setHasKey(false)
      setKeyLast4(null)
      setMessage({ kind: 'ok', text: 'Key removed — using the app default now.' })
      toast.success('Key removed — using the app default now.')
    } else {
      setMessage({ kind: 'err', text: res.error })
      toast.error(res.error || "Couldn't remove the key.")
    }
  }

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      {/* Provider + model */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Provider</span>
          <select
            value={provider}
            onChange={(e) => changeProvider(e.target.value as Provider)}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground"
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-medium text-muted-foreground">Model</span>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground"
          >
            {info?.models.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* API key */}
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">
          API key {hasKey && <span className="text-foreground">(saved: ••••{keyLast4})</span>}
        </span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder={hasKey ? 'Enter a new key to replace the saved one' : 'Paste your API key'}
          className="w-full rounded-lg border border-border bg-background p-2.5 text-sm text-foreground"
          autoComplete="off"
        />
      </label>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
        {hasKey && (
          <button
            onClick={handleClear}
            disabled={saving}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Remove key
          </button>
        )}
        {message && (
          <span
            className={`flex items-center gap-1 text-xs ${message.kind === 'ok' ? 'text-green-600' : 'text-red-500'}`}
          >
            {message.kind === 'ok' && <Check className="h-3.5 w-3.5" strokeWidth={2} />}
            {message.text}
          </span>
        )}
      </div>

      {/* How to get a key for the selected provider */}
      {info && (
        <div className="rounded-lg border border-border bg-background p-3">
          <p className="text-xs font-medium text-foreground">How to get a {info.label} key</p>
          <p className="mt-1 text-xs text-muted-foreground">{info.keyHint}</p>
          <a
            href={info.keyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
          >
            Open {info.label} keys
            <ExternalLink className="h-3 w-3" strokeWidth={1.75} />
          </a>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground">
        Your key is encrypted before it&apos;s stored and is only ever used on the server for your own
        requests. Leave it empty to use the app&apos;s built-in model.
      </p>
    </div>
  )
}
