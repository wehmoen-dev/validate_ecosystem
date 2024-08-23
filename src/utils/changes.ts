import * as github from '@actions/github'
import { context } from '@actions/github'
import * as core from '@actions/core'
import * as nodePath from 'path'
import { getOctokit } from './octokit'

const allowedFileNames = ['data.json', 'logo.png']

export type ProjectChange = {
  project: string
  isNew: boolean
  dataJson: boolean
  logo: boolean
}

/**
 * Get all projects that have data.json or logo.png changes in the PR
 * @param token GitHub token
 * @returns List of projects that have data.json or logo.png changes
 */
export async function getPRChanges(): Promise<[ProjectChange[], Error | null]> {
  core.info('Getting PR changes...')
  const { owner, repo } = github.context.repo
  const octokit = await getOctokit()

  const response = await octokit.rest.pulls.listFiles({
    owner,
    repo,
    pull_number: context.payload.pull_request?.number! // Number of the PR, e.g., 1
  })

  if (!response.data) {
    return [[], null]
  }

  const projectMap: { [key: string]: ProjectChange } = {}

  for (const file of response.data || []) {
    // Not a file in projects folder - ignore
    if (!file.filename.startsWith('projects/')) {
      core.info(`Ignoring file: ${file.filename}`)
      continue
    }

    // Split file path to get project name
    const path = file.filename.split('/')
    if (path.length === 3) {
      if (!projectMap[path[1]]) {
        projectMap[path[1]] = {
          project: path[1],
          isNew: false,
          dataJson: false,
          logo: false
        }
      }

      // Check if file is data.json and mark it as changed
      if (file.filename === `projects/${path[1]}/data.json`) {
        projectMap[path[1]].dataJson = true
        if (file.status === 'added') {
          projectMap[path[1]].isNew = true
        }
      }

      // Check if file is logo.png and mark it as changed
      if (file.filename === `projects/${path[1]}/logo.png`) {
        projectMap[path[1]].logo = true
      }

      // Check for files that are not allowed
      if (!allowedFileNames.includes(nodePath.basename(file.filename))) {
        return [
          [],
          new Error(
            `Only data.json and logo.png files are allowed in projects folder. Please remove any extra files and try again.`
          )
        ]
      }
    } else {
      // Check for extra folders that are also not allowed
      if (path.length > 3) {
        return [
          [],
          new Error(
            `Extra folders in your project directory are not allowed. Please remove any extra folders and try again.`
          )
        ]
      }
    }
  }

  // We only care about projects that had data.json or logo.png changes
  return [
    Object.values(projectMap).filter(
      project => project.dataJson || project.logo
    ),
    null
  ]
}
