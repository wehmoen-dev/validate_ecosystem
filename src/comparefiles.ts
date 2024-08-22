import * as core from '@actions/core'

type Website = {
  url: string
  description: string
}

export async function compareDataJson(
  octokit: any,
  owner: string,
  repo: string,
  project: string,
  base: string,
  head: string
): Promise<{ added: Website[]; removed: Website[] }> {
  const baseData = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: `projects/${project}/data.json`,
    ref: base
  })

  const headData = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: `projects/${project}/data.json`,
    ref: head
  })

  const targetContent = Buffer.from(baseData.data.content, 'base64').toString(
    'utf-8'
  )
  const prContent = Buffer.from(headData.data.content, 'base64').toString(
    'utf-8'
  )

  try {
    const currentContent = JSON.parse(targetContent)
    const futureContent = JSON.parse(prContent)

    let update = {
      added: [],
      removed: []
    }

    if (!Object.keys(currentContent).includes('websites')) {
      core.info(
        `data.json in baseRef for project ${project} is missing the websites key. New project!`
      )
      currentContent['websites'] = []
    }

    if (!Object.keys(futureContent).includes('websites')) {
      core.setFailed(
        `data.json in headRef for project ${project} is missing the websites key`
      )
      return { added: [], removed: [] }
    }

    const removedWebsites = []
    const addedWebsites = []

    for (const website of currentContent.websites) {
      if (!futureContent.websites.find((w: Website) => w.url === website.url)) {
        removedWebsites.push(website)
      }
    }

    for (const website of futureContent.websites) {
      if (
        !currentContent.websites.find((w: Website) => w.url === website.url)
      ) {
        addedWebsites.push(website)
      }
    }

    if (removedWebsites.length === 0 && addedWebsites.length === 0) {
      return { added: [], removed: [] }
    }

    return { added: addedWebsites, removed: removedWebsites }
  } catch (e: any) {
    core.setFailed(e.message)
  }

  return { added: [], removed: [] }
}
