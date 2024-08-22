import { getOctokit } from './octokit'
import * as github from '@actions/github'

export async function getPRDetails() {
  const octokit = await getOctokit()
  const context = github.context
  const details = await octokit.rest.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  })
  return details.data
}
