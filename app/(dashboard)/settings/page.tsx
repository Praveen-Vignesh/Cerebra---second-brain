import { getAiSettings } from '@/actions/settings'
import SettingsClient from '@/components/settings/SettingsClient'
import ThemeToggle from '@/components/dashboard/themeToggle'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

// Settings: appearance (theme) + the bring-your-own AI key config.
export default async function SettingsPage() {
  const settings = await getAiSettings()

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage appearance and your AI provider.</p>
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Appearance</h2>
          <p className="text-xs text-muted-foreground">Switch between light and dark.</p>
        </div>
        <ThemeToggle />
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">AI provider</h2>
          <p className="text-xs text-muted-foreground">
            Bring your own API key from Gemini, OpenAI, or Claude — generations and analysis will use it.
            Leave it unset to use the app&apos;s built-in model.
          </p>
        </div>
        <SettingsClient initial={settings} />
      </section>
    </div>
  )
}
