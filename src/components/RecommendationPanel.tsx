import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import type { Recommendation } from '../domain/types'
import type { Language } from '../i18n/dictionary'
import { recommendationText } from '../i18n/dictionary'

const iconBySeverity = {
  info: Info,
  watch: AlertTriangle,
  urgent: CheckCircle2,
}

type RecommendationPanelProps = {
  title: string
  recommendations: Recommendation[]
  language: Language
}

export const RecommendationPanel = ({ title, recommendations, language }: RecommendationPanelProps) => (
  <section className="panel recommendations" data-testid="recommendations">
    <div className="panel-title">
      <h2>{title}</h2>
      <span>{recommendations.length}</span>
    </div>
    <div className="recommendation-list">
      {recommendations.map((recommendation) => {
        const Icon = iconBySeverity[recommendation.severity]
        return (
          <article className={`recommendation recommendation--${recommendation.severity}`} key={`${recommendation.code}-${recommendation.location ?? recommendation.signal ?? 'base'}`}>
            <Icon size={18} />
            <p>{recommendationText(recommendation, language)}</p>
          </article>
        )
      })}
    </div>
  </section>
)
