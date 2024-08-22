import { getOctokit } from './octokit'
import * as github from '@actions/github'

const BUDDY_NAME = 'ronin-buddy[bot]'

export async function approvePR() {
  const octokit = await getOctokit()
  const context = github.context
  await octokit.rest.pulls.createReview({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    event: 'APPROVE'
  })
}

export async function requestChangesPR(body: string) {
  const octokit = await getOctokit()
  const context = github.context
  await octokit.rest.pulls.createReview({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number,
    body,
    event: 'REQUEST_CHANGES'
  })
}

export async function removeApproval() {
  const octokit = await getOctokit()
  const context = github.context
  const reviews = await octokit.rest.pulls.listReviews({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.issue.number
  })

  for (const review of reviews.data) {
    if (review.user!.login === BUDDY_NAME && review.state === 'APPROVED') {
      await octokit.rest.pulls.dismissReview({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pull_number: context.issue.number,
        review_id: review.id,
        message:
          'Approval dismissed due to newly introduced conflicts. Please check the comment made by @ronin-buddy.',
        event: 'DISMISS'
      })
    }
  }
}
