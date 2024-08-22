import { getOctokit } from './octokit'
import * as github from '@actions/github'

const context = github.context

export async function comments(issueNumber: number, body: string) {
  const octokit = await getOctokit()

  const comment = await octokit.rest.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: issueNumber,
    body
  })

  return comment.data
}

export async function remove(commendId: number) {
  const octokit = await getOctokit()

  await octokit.rest.issues.deleteComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: commendId
  })
}

export async function edit(commentId: number, body: string) {
  const octokit = await getOctokit()

  const comment = await octokit.rest.issues.updateComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    comment_id: commentId,
    body
  })

  return comment.data
}
