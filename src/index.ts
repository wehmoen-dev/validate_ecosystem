import * as core from '@actions/core'
import * as github from '@actions/github'
import { runPR } from './handler/pr'
import { getPRDetails } from './utils/pr'
import { mergedPr } from './handler/mergedPr'

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  const context = github.context

  switch (context.eventName) {
    case 'pull_request':
    case 'pull_request_target':
      const details = await getPRDetails()
      if (!details.merged && details.state !== 'closed') {
        await runPR()
      } else if (details.merged && details.state === 'closed') {
        await mergedPr()
      }
      break
    default:
      core.setFailed(`Unsupported event: ${context.eventName}`)
      process.exit(1)
  }
}

run().catch(error => {
  core.setFailed(error.message)
  process.exit(1)
})
