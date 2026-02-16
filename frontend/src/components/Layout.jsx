import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import ChatWidget from './ChatWidget'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <>
      <Header />
      <main className={styles.body}>
        <div className={styles.bodyInner}>
          <Outlet />
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </>
  )
}
