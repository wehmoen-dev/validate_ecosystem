export type ProjectUpdate = {
  project: string
  status: 'success' | 'failure'
  dataJson: {
    updated: boolean
    success: boolean
    message: string
  }
  logo: {
    updated: boolean
    success: boolean
    message: string
  }
}

export type Website = {
  url: string
  description: string
}
