import { useParams } from 'react-router-dom'
import Markdown from 'react-markdown'
import { getPageBySlug } from '../content'

export default function Page() {
  const { slug } = useParams()
  const page = getPageBySlug(slug)

  if (!page) {
    return <div className="page"><h1>404</h1><p>Page not found.</p></div>
  }

  return (
    <div className="page">
      <Markdown>{page.body}</Markdown>
    </div>
  )
}
