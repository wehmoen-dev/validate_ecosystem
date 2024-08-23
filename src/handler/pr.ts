import * as core from '@actions/core'
import { requirePullRequest } from '../utils/checks'
import {
  installValidator,
  validateDataJson,
  validateLogo
} from '../utils/validate'
import { getPRChanges, prTooBig } from '../utils/changes'
import { addLabelIfNotexists, setLabel } from '../utils/labels'
import * as github from '@actions/github'
import { render } from '../utils/templates'
import { comments, edit, remove } from '../utils/comments'
import { ProjectUpdate } from './types'
import { approvePR, removeApproval, requestChangesPR } from '../utils/review'
import { getOctokit } from '../utils/octokit'

export async function runPR() {
  requirePullRequest()

  const token = core.getInput('GITHUB_TOKEN', {
    required: true,
    trimWhitespace: true
  })
  core.setSecret(token)

  const validatorVersion = core.getInput('VALIDATOR_VERSION', {
    required: true,
    trimWhitespace: true
  })

  const octokit = await getOctokit()

  const context = github.context

  if (context.payload.pull_request!.base.ref !== 'master') {
    core.warning('Pull request is not targeting master branch!')
  }

  if (await prTooBig()) {
    await requestChangesPR(
      render('generic_error', {
        MESSAGE: `🚨 Something went wrong 🚨\n\nThis pull request is too big for an automated review. Please limit the number of files changed in a single PR.\nIf you need to make a large change, consider breaking it up into smaller PRs.`
      })
    )

    await removeApproval()
    await setLabel('validation-failed')
    core.setFailed(
      'This PR introduces too many changes. Please limit the number of changes introduced in a single PR. (Max number of changed filed exceeded: 3000)'
    )
    return
  }

  const [changes, error] = await getPRChanges()

  if (changes.length === 0 && error === null) {
    core.info('No changes detected. Nothing todo! 🎉')
    return
  }

  await setLabel('validation-pending')

  const mainComment = await comments(context.issue.number, render('pr_created'))

  if (error) {
    await remove(mainComment.id)
    await requestChangesPR(
      render('generic_error', {
        MESSAGE: `🚨 Something went wrong 🚨\n\n` + error.message
      })
    )

    await removeApproval()
    await setLabel('validation-failed')
    core.setFailed(error.message)
    return
  }

  await installValidator(validatorVersion)

  let results: ProjectUpdate[] = []

  for (const change of changes) {
    if (change.isNew) {
      await addLabelIfNotexists(octokit, 'new-project')
    }

    let result: ProjectUpdate = {
      project: change.project,
      status: 'success',
      dataJson: {
        updated: change.dataJson,
        message: 'Not changed / Not found',
        success: true
      },
      logo: {
        updated: change.logo,
        message: 'Not changed / Not found',
        success: true
      }
    }

    if (change.dataJson) {
      const validationResult = await validateDataJson(change.project)
      result.dataJson = {
        updated: change.dataJson,
        message:
          validationResult === 'valid' ? 'Looks good 🎉' : validationResult,
        success: validationResult === 'valid'
      }
    }

    if (change.logo) {
      const validationResult: string = await validateLogo(change.project)
      result.logo = {
        updated: change.logo,
        message:
          validationResult === 'valid' ? 'Looks good 🎉' : validationResult,
        success: validationResult === 'valid'
      }
    }

    result.status =
      result.dataJson.success && result.logo.success ? 'success' : 'failure'

    core.info(`Validation result for ${change.project}: ${result.status}`)

    results.push(result)
  }

  let projectResultString: string[] = []

  for (const result of results) {
    projectResultString.push(
      render('project_validation_result', {
        PROJECT: `\`${result.project}\``,
        STATUS:
          result.status === 'success'
            ? '✅ Looks good'
            : '❌ Validation failed',
        DETAILS: [
          `#### ${result.dataJson.success ? '✅' : '❌'} data.json`,
          `${result.dataJson.message}`,
          '',
          `#### ${result.logo.success ? '✅' : '❌'} logo.png`,
          `${result.logo.message}`
        ].join('\n')
      })
    )
  }

  const finalReviewString = render('pr_validated', {
    RESULTS: projectResultString.join('\n')
  })

  const status = results.every(
    result => result.dataJson.success && result.logo.success
  )
    ? 'success'
    : 'failure'

  if (status === 'success') {
    await approvePR()
    await edit(mainComment.id, finalReviewString)
    await setLabel('validation-passed')
  } else {
    await remove(mainComment.id)
    await removeApproval()
    await requestChangesPR(finalReviewString)
    await setLabel('validation-failed')
    core.setFailed(
      "One or more projects didn't pass validation. Please check the comment we left on your PR."
    )
  }
}
