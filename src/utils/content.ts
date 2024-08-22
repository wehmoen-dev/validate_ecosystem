import { getOctokit } from './octokit'
import * as github from '@actions/github'
import { Website } from '../handler/types'

const context = github.context

export async function getContentHashRef(file: string, ref: string) {
  const octokit = await getOctokit()

  try {
    const response = await octokit.rest.repos.getContent({
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: file,
      ref
    })

    // It is there. Not sure why the typing is off here.
    //@ts-ignore
    return Buffer.from(response.data.content, 'base64').toString('utf-8')
  } catch (e) {
    return JSON.stringify({
      websites: [] as Website[]
    })
  }
}
