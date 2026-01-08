import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadAndDeploy } from '../api/deployments'
import { listProjects } from '../api/projects'
import type { Project } from '../api/types'

export function DeployPage() {
  const nav = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [projectId, setProjectId] = useState('')
  const [environmentName, setEnvironmentName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [scheduleEnabled, setScheduleEnabled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('') // yyyy-mm-dd
  const [scheduleTime, setScheduleTime] = useState('') // HH:mm
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const data = await listProjects()
        setProjects(data)
        if (data[0]?._id) {
          setProjectId(data[0]._id)
          setEnvironmentName(data[0].environment || '')
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || e?.message || 'Failed to load projects')
      }
    })()
  }, [])

  const selectedProject = useMemo(() => projects.find((p) => p._id === projectId) || null, [projects, projectId])

  useEffect(() => {
    // auto-fill env name from project when user switches project
    if (selectedProject?.environment) setEnvironmentName(selectedProject.environment)
  }, [selectedProject?._id])

  const scheduleTimeIso = useMemo(() => {
    if (!scheduleEnabled) return undefined
    if (!scheduleDate || !scheduleTime) return undefined
    // This string is interpreted as local time by JS Date constructor.
    const d = new Date(`${scheduleDate}T${scheduleTime}`)
    if (Number.isNaN(d.getTime())) return undefined
    return d.toISOString()
  }, [scheduleEnabled, scheduleDate, scheduleTime])

  async function submit() {
    setError(null)
    if (!projectId) return setError('Please select a project.')
    if (!environmentName.trim()) return setError('Please enter an environmentName.')
    if (!file) return setError('Please choose a .app file.')

    setLoading(true)
    try {
      const res = await uploadAndDeploy({
        projectId,
        environmentName: environmentName.trim(),
        file,
        scheduleTimeIso,
      })
      nav(`/deployments/${res.deploymentId}`)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to start deployment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <header className="pageHeader">
        <div>
          <h1 className="h1">Deploy</h1>
          <p className="muted">
            Upload a Business Central <span className="mono">.app</span> file and deploy it (now or at a scheduled
            time).
          </p>
        </div>
      </header>

      {error ? <div className="alert alertDanger">{error}</div> : null}

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Upload & Deploy</div>
          <div className="muted">Uses backend endpoint: POST /api/deployments/upload-and-deploy</div>
        </div>

        <div className="formGrid">
          <label className="field span2">
            <div className="label">Project</div>
            <select
              className="input"
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loading}
            >
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.projectName} ({p.environment})
                </option>
              ))}
            </select>
          </label>

          <label className="field span2">
            <div className="label">Environment Name</div>
            <input
              className="input"
              value={environmentName}
              onChange={(e) => setEnvironmentName(e.target.value)}
              placeholder="Prk_ProdCopy_29_11_2025"
              disabled={loading}
            />
            <div className="hint">
              This is used in BC API base URL: <span className="mono">/v2.0/&lt;environmentName&gt;/api/...</span>
            </div>
          </label>

          <label className="field span2">
            <div className="label">.app file</div>
            <input
              className="input"
              type="file"
              accept=".app"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </label>

          <div className="field span2">
            <div className="label">Schedule</div>
            <div className="row" style={{ gap: 14, flexWrap: 'wrap' }}>
              <label className="row" style={{ gap: 8 }}>
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={!scheduleEnabled}
                  onChange={() => setScheduleEnabled(false)}
                  disabled={loading}
                />
                <span>Deploy now</span>
              </label>
              <label className="row" style={{ gap: 8 }}>
                <input
                  type="radio"
                  name="scheduleMode"
                  checked={scheduleEnabled}
                  onChange={() => setScheduleEnabled(true)}
                  disabled={loading}
                />
                <span>Schedule</span>
              </label>
            </div>

            {scheduleEnabled ? (
              <div className="formGrid" style={{ marginTop: 10 }}>
                <label className="field">
                  <div className="label">Date (calendar)</div>
                  <input
                    className="input"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    disabled={loading}
                  />
                </label>

                <label className="field">
                  <div className="label">Time (clock)</div>
                  <input
                    className="input"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    step={60}
                    disabled={loading}
                  />
                </label>

                <div className="field span2">
                  <div className="hint">
                    We treat this as your <b>local time</b> and send it to backend as UTC ISO string.
                  </div>
                </div>
              </div>
            ) : (
              <div className="hint" style={{ marginTop: 8 }}>
                No schedule time set — deployment starts immediately.
              </div>
            )}
          </div>

          <div className="field">
            <div className="label">Schedule preview</div>
            <div className="mono box">
              {scheduleTimeIso ? scheduleTimeIso : <span className="muted">Not scheduled (deploy immediately)</span>}
            </div>
            <div className="hint">We convert your local time to UTC ISO string for the backend.</div>
          </div>
        </div>

        <div className="actions">
          <button className="btn btnPrimary" onClick={submit} disabled={loading}>
            {loading ? 'Starting…' : scheduleTimeIso ? 'Schedule Deployment' : 'Deploy Now'}
          </button>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Quick tips</div>
        </div>
        <ul className="list">
          <li>
            If you often deploy to the same environment, store it in the Project as “Default Environment Name” and it
            will auto-fill here.
          </li>
          <li>
            After deploy starts, the backend polls BC for a few minutes. If BC removes the upload session, the backend
            switches to <span className="mono">processing</span> and verifies installation after ~4 minutes.
          </li>
        </ul>
      </section>
    </div>
  )
}


