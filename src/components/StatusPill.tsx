import type { DeploymentStatus } from '../api/types'

export function StatusPill({ status }: { status: DeploymentStatus }) {
  const cls =
    status === 'completed'
      ? 'pill pillSuccess'
      : status === 'failed'
        ? 'pill pillDanger'
        : status === 'processing'
          ? 'pill pillWarn'
          : status === 'deploying' || status === 'running'
            ? 'pill pillInfo'
            : 'pill'

  return <span className={cls}>{status}</span>
}


