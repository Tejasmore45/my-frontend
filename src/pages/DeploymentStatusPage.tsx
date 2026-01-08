import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getDeployment, updateDeploymentStatus } from '../api/deployments'
import type { Deployment } from '../api/types'
import { StatusPill } from '../components/StatusPill'

function formatDate(s?: string | null) {
  if (!s) return '-'
  const d = new Date(s)
  if (Number.isNaN(d.getTime())) return s
  return d.toLocaleString()
}

export function DeploymentStatusPage() {
  const { deploymentId } = useParams()
  const [data, setData] = useState<Deployment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualId, setManualId] = useState('')

  async function load(id: string) {
    setLoading(true)
    setError(null)
    try {
      const d = await getDeployment(id)
      setData(d)
    } catch (e: any) {
      setData(null)
      setError(e?.response?.data?.message || e?.message || 'Failed to load deployment')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!deploymentId) return
    load(deploymentId)
  }, [deploymentId])

  const isTerminal = data?.status === 'completed' || data?.status === 'failed'

  useEffect(() => {
    if (!deploymentId) return
    if (isTerminal) return

    const t = window.setInterval(() => {
      load(deploymentId)
    }, 5000)

    return () => window.clearInterval(t)
  }, [deploymentId, isTerminal])

  const lastLogs = useMemo(() => (data?.logs || []).slice().reverse(), [data?.logs])

  async function mark(status: 'completed' | 'failed') {
    if (!deploymentId) return
    setError(null)
    setLoading(true)
    try {
      await updateDeploymentStatus(deploymentId, status)
      await load(deploymentId)
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stack">
      <header className="pageHeader">
        <div>
          <h1 className="h1">Deployment Status</h1>
          <p className="muted">
            {deploymentId ? (
              <>
                Deployment ID: <span className="mono">{deploymentId}</span>
              </>
            ) : (
              'No deploymentId in URL.'
            )}
          </p>
        </div>
        <div className="row">
          <Link className="btn btnSecondary" to="/deploy">
            New deploy
          </Link>
          <button className="btn btnSecondary" onClick={() => deploymentId && load(deploymentId)} disabled={loading}>
            Refresh
          </button>
        </div>
      </header>

      {error ? <div className="alert alertDanger">{error}</div> : null}

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Overview</div>
          {data ? <StatusPill status={data.status} /> : null}
        </div>

        {!data ? (
          <div className="muted">{loading ? 'Loading…' : 'No data loaded.'}</div>
        ) : (
          <div className="kvGrid">
            <div className="kv">
              <div className="k">Status</div>
              <div className="v">
                <StatusPill status={data.status} />
                {!isTerminal ? <span className="muted"> (auto-refreshing every 5s)</span> : null}
              </div>
            </div>
            <div className="kv">
              <div className="k">Created</div>
              <div className="v">{formatDate(data.createdAt)}</div>
            </div>
            <div className="kv">
              <div className="k">Upload System ID</div>
              <div className="v mono">{data.uploadSystemId || '-'}</div>
            </div>
            <div className="kv">
              <div className="k">Retry Count</div>
              <div className="v">{data.retryCount ?? 0}</div>
            </div>
            <div className="kv">
              <div className="k">Verification Check Time</div>
              <div className="v">{formatDate(data.verificationCheckTime || null)}</div>
            </div>
            <div className="kv">
              <div className="k">Extension Info</div>
              <div className="v mono">
                {data.extensionInfo
                  ? `${data.extensionInfo.publisher || 'N/A'} | ${data.extensionInfo.name || 'N/A'} | ${
                      data.extensionInfo.version || 'N/A'
                    }`
                  : '-'}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Logs (latest first)</div>
        </div>
        <div className="logBox">
          {lastLogs.length ? (
            lastLogs.map((l, idx) => (
              <div key={idx} className="logLine">
                {l}
              </div>
            ))
          ) : (
            <div className="muted">No logs yet.</div>
          )}
        </div>
      </section>

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Manual actions</div>
          <div className="muted">Only use if you verified in BC UI.</div>
        </div>
        <div className="rowActions">
          <button
            className="btn btnSuccess"
            onClick={() => mark('completed')}
            disabled={loading || !deploymentId || isTerminal}
            title={isTerminal ? 'Already completed/failed' : 'Mark as completed'}
          >
            Mark Completed
          </button>
          <button
            className="btn btnDanger"
            onClick={() => mark('failed')}
            disabled={loading || !deploymentId || isTerminal}
            title={isTerminal ? 'Already completed/failed' : 'Mark as failed'}
          >
            Mark Failed
          </button>
        </div>
      </section>

      <section className="card">
        <div className="cardHeader">
          <div className="cardTitle">Open another deployment</div>
        </div>
        <div className="row">
          <input
            className="input"
            value={manualId}
            onChange={(e) => setManualId(e.target.value)}
            placeholder="Paste deploymentId..."
          />
          <Link className="btn btnSecondary" to={manualId ? `/deployments/${manualId}` : '#'} onClick={(e) => !manualId && e.preventDefault()}>
            Open
          </Link>
        </div>
      </section>
    </div>
  )
}


