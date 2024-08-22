import * as core from '@actions/core'

export async function getOctokit() {
  const octokit = await import('octokit')

  const installationId = core.getInput('BUDDY_INSTALLATION_ID', {
    required: true,
    trimWhitespace: true
  })
  const appId = core.getInput('BUDDY_APP_ID', {
    required: true,
    trimWhitespace: true
  })
  const privatekey = core.getInput('BUDDY_PRIVATE_KEY', {
    required: true,
    trimWhitespace: true
  })

  const buddyApp = new octokit.App({
    appId: appId,
    privateKey: privatekey
  })

  return buddyApp.getInstallationOctokit(Number(installationId))
}
