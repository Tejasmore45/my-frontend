export type Project = {
  _id: string
  projectName: string
  tenantId: string
  clientId: string
  clientSecret?: string
  environment: string
  companyId?: string
  companyName?: string
  notificationEmails?: string[]
  deploymentRetryWaitMinutes?: number
  maxDeploymentRetries?: number
  createdAt?: string
}

export type DeploymentStatus =
  | 'pending'
  | 'scheduled'
  | 'running'
  | 'deploying'
  | 'processing'
  | 'completed'
  | 'failed'

export type ExtensionInfo = {
  name?: string
  publisher?: string
  version?: string
  id?: string | null
}

export type Deployment = {
  status: DeploymentStatus
  logs: string[]
  uploadSystemId: string | null
  createdAt: string
  retryCount?: number
  verificationCheckTime?: string | null
  extensionInfo?: ExtensionInfo | null
}

export type UploadAndDeployResponse = {
  message: string
  deploymentId: string
  status: DeploymentStatus
  scheduleTime?: string | null
}


