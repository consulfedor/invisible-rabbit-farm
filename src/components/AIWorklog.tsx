import { Bot, ShieldCheck } from 'lucide-react'
import type { Language } from '../i18n/dictionary'
import { worklogEntries } from '../i18n/dictionary'

type AIWorklogProps = {
  title: string
  lead: string
  language: Language
}

export const AIWorklog = ({ title, lead, language }: AIWorklogProps) => (
  <section className="panel worklog" data-testid="ai-worklog">
    <div className="panel-title">
      <h2><Bot size={18} /> {title}</h2>
      <span><ShieldCheck size={14} /> safe</span>
    </div>
    <p className="muted">{lead}</p>
    <div className="worklog-grid">
      {worklogEntries[language].map((entry) => (
        <article key={entry.title}>
          <h3>{entry.title}</h3>
          <p>{entry.body}</p>
        </article>
      ))}
    </div>
  </section>
)
