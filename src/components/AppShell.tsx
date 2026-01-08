import { NavLink } from 'react-router-dom'
import { API_BASE_URL } from '../api/client'

type Props = {
  children: React.ReactNode
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `navItem ${isActive ? 'navItemActive' : ''}`}
      end
    >
      {label}
    </NavLink>
  )
}

export function AppShell({ children }: Props) {
  return (
    <div className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandTitle">BC Extension Deployer</div>
          <div className="brandSub">Backend: {API_BASE_URL}</div>
        </div>

        <nav className="nav">
          <NavItem to="/projects" label="Projects" />
          <NavItem to="/deploy" label="Deploy" />
        </nav>

        <div className="sidebarFooter">
          <div className="helpText">
            Tip: create/select a Project, then upload a .app to deploy (immediate or scheduled).
          </div>
        </div>
      </aside>

      <main className="main">
        <div className="container">{children}</div>
      </main>
    </div>
  )
}


