import { api } from './client'
import type { Project } from './types'

export async function listProjects(): Promise<Project[]> {
  const res = await api.get<Project[]>('/api/projects')
  return res.data
}

export type CreateProjectInput = {
  projectName: string
  tenantId: string
  clientId: string
  clientSecret: string
  environment: string
  companyId?: string
  companyName?: string
  notificationEmails?: string[]
  deploymentRetryWaitMinutes?: number
  maxDeploymentRetries?: number
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await api.post<{ project: Project }>('/api/projects', input)
  return res.data.project
}

export async function updateProjectByTenantId(
  tenantId: string,
  patch: Partial<CreateProjectInput>,
): Promise<Project> {
  const res = await api.put<{ project: Project }>(`/api/projects/${encodeURIComponent(tenantId)}`, patch)
  return res.data.project
}

export async function deleteProjectByTenantId(tenantId: string): Promise<void> {
  await api.delete(`/api/projects/${encodeURIComponent(tenantId)}`)
}


