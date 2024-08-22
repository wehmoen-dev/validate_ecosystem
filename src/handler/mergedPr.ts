import { getOctokit } from '../utils/octokit'
import * as github from '@actions/github'
import { getPRDetails } from '../utils/pr'
import * as core from '@actions/core'
import { getContentHashRef } from '../utils/content'
import { getPRChanges } from '../utils/changes'
import { Website } from './types'
import { render } from '../utils/templates'

const context = github.context

export async function mergedPr() {
  const webhookUrl = core.getInput('slack_webhook_url', {
    required: true,
    trimWhitespace: true
  })

  const octokit = await getOctokit()

  const prDetails = await getPRDetails()

  const mergeSha = prDetails.merge_commit_sha

  if (!mergeSha) {
    core.setFailed('Could not find merge commit SHA.')
    process.exit(1)
  }

  const mergeDetails = await octokit.rest.git.getCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: mergeSha
  })

  const parentCommits = mergeDetails.data.parents

  if (parentCommits.length == 0) {
    core.setFailed('Could not find parent commits. Nothing to compare.')
    process.exit(1)
  }

  const parentCommitSha = parentCommits[0].sha

  const [changes, error] = await getPRChanges(mergeSha, parentCommitSha)

  if (changes.length == 0) {
    if (error) {
      core.setFailed(error.message)
      process.exit(1)
    }
    core.info('No changes detected. Nothing to do! 🎉')
    return
  }

  const dataJsonChanged = changes
    .filter(c => c.dataJson)
    .map(x => `projects/${x.project}/data.json`)

  if (dataJsonChanged.length == 0) {
    core.info('No data.json changes detected. Nothing to do! 🎉')
    return
  }

  let sitesAdded: Website[] = []
  let sitesRemoved: Website[] = []

  for (const dataJson of dataJsonChanged) {
    const oldContent = await getContentHashRef(dataJson, parentCommitSha)
    const newContent = await getContentHashRef(dataJson, mergeSha)

    const oldSites = JSON.parse(oldContent)
    const newSites = JSON.parse(newContent)

    if (!oldSites['websites'] || !newSites['websites']) {
      core.setFailed('Could not find websites in data.json')
      process.exit(1)
    }

    const addedSites = newSites.websites.filter(
      (site: Website) =>
        !oldSites.websites.some((s: Website) => s.url == site.url)
    )
    const removedSites = oldSites.websites.filter(
      (site: Website) =>
        !newSites.websites.some((s: Website) => s.url == site.url)
    )

    sitesAdded.push(...addedSites)
    sitesRemoved.push(...removedSites)
  }

  const slackMessage = {
    username: prDetails.user.login + ' via Ronin Buddy',
    icon_url: prDetails.user.avatar_url || 'https://cdn.axie.bot/default.png',
    attachments: [
      {
        title: `:tada: Pull Request ${prDetails.number} has been merged! :tada:`,
        title_link: prDetails.html_url,
        author_name: prDetails.user.login,
        author_icon: prDetails.user.avatar_url,
        author_link: prDetails.user.html_url,

        fields: [
          {
            title: 'View Pull Request at GitHub',
            value: `<${prDetails.html_url}|${prDetails.html_url}>.`
          },
          {
            title: 'Added Websites',
            value:
              sitesAdded.length > 0
                ? sitesAdded
                    .map(
                      (site: Website) => `- <${site.url}> - ${site.description}`
                    )
                    .join('\n')
                : '- none'
          },
          {
            title: 'Removed Websites',
            value:
              sitesRemoved.length > 0
                ? sitesRemoved
                    .map(
                      (site: Website) => `- <${site.url}> - ${site.description}`
                    )
                    .join('\n')
                : '- none'
          },
          {
            value:
              'Please review these changes and take steps to update the TDS if necessary.'
          }
        ],
        color: '#36a64f'
      }
    ]
  }

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(slackMessage)
    })

    core.info(
      `Pull Request ${context.issue.number} merged. ${sitesAdded.length} sites added and ${sitesRemoved.length} sites removed.`
    )
    core.info('Slack message sent successfully!')
  } catch (e: any) {
    core.setFailed(`Failed to send Slack message: ${e.message}`)
  }
}
