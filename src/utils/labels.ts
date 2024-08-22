import { getOctokit } from './octokit'
import * as github from '@actions/github'

const context = github.context

type LabelName =
  | 'validation-passed'
  | 'validation-failed'
  | 'validation-pending'
  | 'new-project'

type Label = {
  name: LabelName
  color: string
}

const LABELS: Label[] = [
  {
    name: 'validation-passed',
    color: '00ff00'
  },
  {
    name: 'validation-failed',
    color: 'ff0000'
  },
  {
    name: 'validation-pending',
    color: 'ffff00'
  },
  {
    name: 'new-project',
    color: 'add8e6'
  }
]

export async function setLabel(label: LabelName) {
  const octokit = await getOctokit()

  await ensureLabels(octokit)

  switch (label) {
    case 'validation-passed':
      await removeLabelIfExists(octokit, 'validation-failed')
      await removeLabelIfExists(octokit, 'validation-pending')
      break
    case 'validation-failed':
      await removeLabelIfExists(octokit, 'validation-passed')
      await removeLabelIfExists(octokit, 'validation-pending')
      break
    case 'validation-pending':
      await removeLabelIfExists(octokit, 'validation-passed')
      await removeLabelIfExists(octokit, 'validation-failed')
      break
  }

  await addLabelIfNotexists(octokit, label)
}

async function removeLabelIfExists(octokit: any, label: string) {
  const prLabels = await octokit.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })

  if (prLabels.data.find((lbl: any) => lbl.name === label)) {
    await octokit.rest.issues.removeLabel({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      name: label
    })
  }
}

export async function addLabelIfNotexists(octokit: any, label: string) {
  const prLabels = await octokit.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })

  if (!prLabels.data.find((lbl: any) => lbl.name === label)) {
    await octokit.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      labels: [label]
    })
  }
}

async function ensureLabels(octokit: any) {
  const labelsOnRepo = await octokit.rest.issues.listLabelsForRepo({
    owner: context.repo.owner,
    repo: context.repo.repo
  })

  for (const lbl of LABELS) {
    if (!labelsOnRepo.data.find((label: any) => label.name === lbl.name)) {
      await octokit.rest.issues.createLabel({
        owner: context.repo.owner,
        repo: context.repo.repo,
        name: lbl.name,
        color: lbl.color
      })
    }
  }
}

async function removeAllLabels() {
  const octokit = await getOctokit()

  const prLabels = await octokit.rest.issues.listLabelsOnIssue({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number
  })

  for (const lbl of prLabels.data) {
    await removeLabelIfExists(octokit, lbl.name)
  }
}
