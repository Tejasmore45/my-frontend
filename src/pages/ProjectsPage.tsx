import { useEffect, useMemo, useState } from 'react'
import type { Project } from '../api/types'
import {
  createProject,
  deleteProjectByTenantId,
  listProjects,
  updateProjectByTenantId,
  type CreateProjectInput,
} from '../api/projects'

const empty: CreateProjectInput = {
  projectName: '',
  tenantId: '',
  clientId: '',
  clientSecret: '',
  environment: '',
  companyId: '',
  companyName: '',
  notificationEmails: [],
  deploymentRetryWaitMinutes: 10,
  maxDeploymentRetries: 3,
}

function parseEmails(input: string): string[] {
  return input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mode, setMode] = useState<'create' | 'edit'>('create')
  const [editingTenantId, setEditingTenantId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateProjectInput>({ ...empty })
  const [emailsText, setEmailsText] = useState('')

  async function refresh() {
    setLoading(true)
    setError(null)
    try {
      const data = await listProjects()
      setProjects(data)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  }, [projects])

  function startCreate() {
    setMode('create')
    setEditingTenantId(null)
    setForm({ ...empty })
    setEmailsText('')
  }

  function startEdit(p: Project) {
    setMode('edit')
    setEditingTenantId(p.tenantId)
    setForm({
      projectName: p.projectName || '',
      tenantId: p.tenantId || '',
      clientId: p.clientId || '',
      clientSecret: '', // don't prefill secret
      environment: p.environment || '',
      companyId: p.companyId || '',
      companyName: p.companyName || '',
      notificationEmails: p.notificationEmails || [],
      deploymentRetryWaitMinutes: p.deploymentRetryWaitMinutes ?? 10,
      maxDeploymentRetries: p.maxDeploymentRetries ?? 3,
    })
    setEmailsText((p.notificationEmails || []).join(', '))
  }

  async function submit() {
    setError(null)
    setLoading(true)
    try {
      const payload: CreateProjectInput = {
        ...form,
        notificationEmails: parseEmails(emailsText),
        deploymentRetryWaitMinutes: Number(form.deploymentRetryWaitMinutes ?? 10),
        maxDeploymentRetries: Number(form.maxDeploymentRetries ?? 3),
      }

      if (mode === 'create') {
        await createProject(payload)
      } else if (mode === 'edit' && editingTenantId) {
        // Only send clientSecret if user typed it (avoid overwriting with empty)
        const patch: Partial<CreateProjectInput> = { ...payload }
        if (!patch.clientSecret) delete patch.clientSecret

        await updateProjectByTenantId(editingTenantId, patch)
      }

      startCreate()
      await refresh()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  async function remove(tenantId: string) {
    const ok = window.confirm('Delete this project? This cannot be undone.')
    if (!ok) return
    setError(null)
    setLoading(true)
    try {
      await deleteProjectByTenantId(tenantId)
      await refresh()
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to delete project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <header className="pageHeader">
        <div>
          <h1 className="h1">Projects</h1>
          <p className="muted">
            A Project stores Azure AD credentials + BC company/environment info so the backend can generate tokens and
            deploy extensions.
          </p>
        </div>
        <button className="btn btnSecondary" onClick={refresh} disabled={loading}>
          Refresh
        </button>
      </header>

      {error ? <div className="alert alertDanger">{error}</div> : null}

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">{mode === 'create' ? 'Create Project' : `Edit Project (${editingTenantId})`}</div>
          {mode === 'edit' ? (
            <button className="btn btnSecondary" onClick={startCreate} disabled={loading}>
              Cancel edit
            </button>
          ) : null}
        </div>

        <div className="formGrid">
          <label className="field">
            <div className="label">Project Name</div>
            <input
              className="input"
              value={form.projectName}
              onChange={(e) => setForm((s) => ({ ...s, projectName: e.target.value }))}
              placeholder="Hub Lee Bas Limited"
            />
          </label>

          <label className="field">
            <div className="label">Tenant ID</div>
            <input
              className="input"
              value={form.tenantId}
              onChange={(e) => setForm((s) => ({ ...s, tenantId: e.target.value }))}
              placeholder="06d72af5-3a98-4d46-81bc-f0be13396418"
              disabled={mode === 'edit'} // update route identifies by tenantId
            />
          </label>

          <label className="field">
            <div className="label">Client ID</div>
            <input
              className="input"
              value={form.clientId}
              onChange={(e) => setForm((s) => ({ ...s, clientId: e.target.value }))}
              placeholder="e4bb31c2-510b-4274-98c9-332bae9fb65a"
            />
          </label>

          <label className="field">
            <div className="label">Client Secret {mode === 'edit' ? '(leave empty to keep existing)' : ''}</div>
            <input
              className="input"
              value={form.clientSecret}
              onChange={(e) => setForm((s) => ({ ...s, clientSecret: e.target.value }))}
              placeholder={mode === 'edit' ? '•••••••• (optional)' : 'Azure app secret'}
              type="password"
            />
          </label>

          <label className="field">
            <div className="label">Default Environment Name</div>
            <input
              className="input"
              value={form.environment}
              onChange={(e) => setForm((s) => ({ ...s, environment: e.target.value }))}
              placeholder="Prk_ProdCopy_29_11_2025"
            />
          </label>

          <label className="field">
            <div className="label">Company ID (Optional)</div>
            <input
              className="input"
              value={form.companyId}
              onChange={(e) => setForm((s) => ({ ...s, companyId: e.target.value }))}
              placeholder="f7bc7e44-fcb9-f011-af5f-6045bdacc856"
            />
          </label>

          <label className="field">
            <div className="label">Company Name (Optional)</div>
            <input
              className="input"
              value={form.companyName}
              onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
              placeholder="CRONUS USA, Inc."
            />
          </label>

          <label className="field span2">
            <div className="label">Notification Emails (comma separated)</div>
            <input
              className="input"
              value={emailsText}
              onChange={(e) => setEmailsText(e.target.value)}
              placeholder="tejas.more@robosol.com, someone@company.com"
            />
          </label>
        </div>

        <div className="actions">
          <button className="btn btnPrimary" onClick={submit} disabled={loading}>
            {mode === 'create' ? 'Create Project' : 'Save Changes'}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Existing Projects</div>
          <div className="muted">{loading ? 'Loading…' : `${projects.length} project(s)`}</div>
        </div>

        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Tenant</th>
                <th>Environment</th>
                <th>Company</th>
                <th>Emails</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p._id}>
                  <td className="mono">{p.projectName}</td>
                  <td className="mono">{p.tenantId}</td>
                  <td className="mono">{p.environment}</td>
                  <td className="mono">{p.companyId}</td>
                  <td className="mono">{(p.notificationEmails || []).join(', ') || '-'}</td>
                  <td>
                    <div className="rowActions">
                      <button className="btn btnSecondary btnSmall" onClick={() => startEdit(p)} disabled={loading}>
                        Edit
                      </button>
                      <button
                        className="btn btnDanger btnSmall"
                        onClick={() => remove(p.tenantId)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!sorted.length ? (
                <tr>
                  <td colSpan={6} className="muted" style={{ padding: 16 }}>
                    No projects found. Create one above.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}


