import { Link, Outlet } from 'react-router-dom'
import { getPages } from '../content'

export default function Layout() {
  const pages = getPages()

  return (
    <div className="layout">
      <nav>
        <ul>
          {pages.map((page) => (
            <li key={page.slug}>
              <Link to={`/${page.slug}`}>{page.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
