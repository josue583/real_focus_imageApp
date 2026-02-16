import { Link, useLocation } from 'react-router-dom'
import Logo from './Logo'
import styles from './Header.module.css'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className={styles.header}>
      <Logo asLink={true} size="default" />
      <nav className={styles.nav}>
        {isHome ? (
          <>
            <a href="#packages" className={styles.navLink}>Packages</a>
            <Link to="/gallery" className={styles.navLink}>Gallery</Link>
            <a href="#book" className={styles.cta}>Book Now</a>
          </>
        ) : (
          <>
            <Link to="/#packages" className={styles.navLink}>Packages</Link>
            <Link to="/gallery" className={styles.navLink}>Gallery</Link>
            <Link to="/#book" className={styles.cta}>Book Now</Link>
          </>
        )}
      </nav>
    </header>
  )
}
