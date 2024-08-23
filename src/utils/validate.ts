import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as io from '@actions/io'
import path from 'path'
import imageJs from 'image-js'
import fs from 'fs'

const VALIDATOR_RELEASE_URL =
  'https://api.github.com/repos/wehmoen-dev/ecosystem-projects-validation/releases/latest'

const VALIDATOR_DOWNLOAD_PATH = '/tmp/ecosystem-projects-validation.tar.gz'
const VALIDATOR_INSTALL_DIR = '/bin'
const VALIDATOR_BINARY_NAME = 'validate'

const VALIDATOR_EXECUTABLE = path.join(
  VALIDATOR_INSTALL_DIR,
  VALIDATOR_BINARY_NAME
)

function ValidatorDownloadUrl(tag: string) {
  return `https://github.com/wehmoen-dev/ecosystem-projects-validation/releases/download/${tag}/ecosystem-projects-validation-linux-amd64.tar.gz`
}

export async function installValidator(version: string) {
  try {
    if (version === 'latest') {
      const response = await fetch(VALIDATOR_RELEASE_URL)
      const latestRelease = await response.json()
      version = latestRelease.tag_name
    }

    const downloadUrl = ValidatorDownloadUrl(version)

    await exec.exec(`curl -sL -o ${VALIDATOR_DOWNLOAD_PATH} ${downloadUrl}`)
    await exec.exec(
      `tar -xzf ${VALIDATOR_DOWNLOAD_PATH} -C ${VALIDATOR_INSTALL_DIR}`
    )
    await io.mv(
      path.join(VALIDATOR_INSTALL_DIR, 'validate-linux-amd64'),
      path.join(VALIDATOR_INSTALL_DIR, VALIDATOR_BINARY_NAME)
    )
    await exec.exec(
      `chmod +x ${path.join(VALIDATOR_INSTALL_DIR, VALIDATOR_BINARY_NAME)}`
    )
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

export async function validateDataJson(project: string) {
  try {
    const validationResult = await exec.getExecOutput(
      VALIDATOR_EXECUTABLE,
      ['-input', `projects/${project}/data.json`],
      { silent: false }
    )
    return validationResult.stdout
  } catch (e: any) {
    core.setFailed(e.message)
    process.exit(1)
  }
}

export async function validateLogo(project: string): Promise<string> {
  const { parse } = await import('file-type-mime')

  const logoPath = `projects/${project}/logo.png`

  let errors: string[] = []

  try {
    const img = await imageJs.load(logoPath)
    const content = fs.readFileSync(logoPath)
    const mime = parse(content)

    if (mime?.mime !== 'image/png') {
      core.info(`Invalid Logo Mime type: ${mime?.mime}`)
      return 'The logo must be a PNG'
    }

    if (img.width < 256 || img.height < 256) {
      errors.push('The logo must be at least 256x256 pixels')
    }

    if (img.width > 1024 || img.width > 1024) {
      errors.push('The logo must be at most 1024x1024 pixels')
    }

    const stats = fs.statSync(logoPath)

    if (stats.size > 1024 * 1024) {
      errors.push('The logo must be at most 1MB')
    }

    if (img.width !== img.height) {
      errors.push('The logo must be square')
    }

    return errors.length === 0 ? 'valid' : errors.join('\n')
  } catch (e: any) {
    return e.message
  }
}
