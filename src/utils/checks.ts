import * as github from '@actions/github'
import * as core from '@actions/core'

export function requirePullRequest() {
  if (
    github.context.eventName !== 'pull_request' &&
    github.context.eventName !== 'pull_request_target'
  ) {
    core.setFailed('This action can only be run on pull requests')
    process.exit(1)
  }
}
