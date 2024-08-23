import * as github from '@actions/github'
import * as core from '@actions/core'
import * as nodePath from 'path'
import { getOctokit } from './octokit'
import { getPRDetails } from './pr'

const allowedFileNames = ['data.json', 'logo.png']

const context = github.context

export type ProjectChange = {
  project: string
  isNew: boolean
  dataJson: boolean
  logo: boolean
}

const MAX_PR_FILES = 3000 // Max allowed by GitHub API

export async function prTooBig(): Promise<boolean> {
  const details = await getPRDetails()
  const changedFiles = details.changed_files
  return changedFiles > MAX_PR_FILES
}

async function getAllPullRequestFiles() {
  const { owner, repo } = context.repo
  const pull_number = context.payload.pull_request?.number!

  const octokit = await getOctokit()

  const perPage = 100 // Max allowed by GitHub API
  let page = 1
  let allFiles: Array<any> = []
  let response

  do {
    response = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number,
      per_page: perPage,
      page
    })

    allFiles = allFiles.concat(response.data)
    core.info(`Getting PR files: ${allFiles.length}`)
    page++
  } while (response.data.length === perPage)

  return allFiles
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

  const files = await getAllPullRequestFiles()

  if (!files || files.length === 0) {
    return [[], null]
  }

  const projectMap: { [key: string]: ProjectChange } = {}

  for (const file of files || []) {
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
