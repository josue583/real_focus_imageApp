import { Link } from 'react-router-dom'
import styles from './Logo.module.css'

const cameraSvg = (
  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
)

export default function Logo({ asLink = true, size = 'default' }) {
  const className = `${styles.logo} ${size === 'small' ? styles.small : ''} ${size === 'large' ? styles.large : ''}`.trim()
  const content = (
    <>
      <span className={styles.iconWrap}>{cameraSvg}</span>
      <span className={styles.text}>Real Focus Image</span>
    </>
  )
  if (asLink) {
    return (
      <Link to="/" className={className} aria-label="Real Focus Image – Home">
        {content}
      </Link>
    )
  }
  return <span className={className}>{content}</span>
}
