import { api } from './client'
import type { Deployment, UploadAndDeployResponse } from './types'

export async function uploadAndDeploy(input: {
  projectId: string
  environmentName: string
  file: File
  scheduleTimeIso?: string
}): Promise<UploadAndDeployResponse> {
  const form = new FormData()
  form.append('projectId', input.projectId)
  form.append('environmentName', input.environmentName)
  if (input.scheduleTimeIso) form.append('scheduleTime', input.scheduleTimeIso)
  form.append('bcApp', input.file)

  const res = await api.post<UploadAndDeployResponse>('/api/deployments/upload-and-deploy', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

export async function getDeployment(deploymentId: string): Promise<Deployment> {
  const res = await api.get<Deployment>(`/api/deployments/${encodeURIComponent(deploymentId)}`)
  return res.data
}

export async function updateDeploymentStatus(deploymentId: string, status: 'completed' | 'failed') {
  const res = await api.patch(`/api/deployments/${encodeURIComponent(deploymentId)}/status`, { status })
  return res.data
}


