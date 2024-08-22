import { template as pr_created } from './templates/pr_created'
import { template as pr_validated } from './templates/pr_validated'
import { template as project_validation_result } from './templates/project_validation_result'
import { template as generic_error } from './templates/generic_error'
import { template as slack_message } from './templates/slack_message'

export type TemplateName =
  | 'pr_created'
  | 'pr_validated'
  | 'project_validation_result'
  | 'generic_error'
  | 'slack_message'

const templates: Record<TemplateName, string> = {
  pr_created,
  pr_validated,
  project_validation_result,
  generic_error,
  slack_message
}

export function render(template: TemplateName, data: Record<string, any> = {}) {
  const keys = Object.keys(data)
  const values = Object.values(data)

  let rendered = templates[template].slice()

  for (const key of keys) {
    rendered = rendered.replace(new RegExp(`{{ ${key} }}`, 'g'), data[key])
  }

  return rendered
}
