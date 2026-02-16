import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import PackageCard from '../components/PackageCard'
import BookingForm from '../components/BookingForm'
import styles from './Home.module.css'

const API = '/api'

export default function Home() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPackageId, setSelectedPackageId] = useState('')
  const location = useLocation()

  const handleSelectPackage = (packageId) => {
    setSelectedPackageId(packageId)
    const el = document.getElementById('book')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    fetch(API + '/packages')
      .then((res) => res.json())
      .then(setPackages)
      .catch(() => setPackages([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const hash = location.hash
    if (!hash) return
    const id = hash.slice(1)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [location.hash])

  const categories = [...new Set(packages.map((p) => p.category))]
  const byCategory = (cat) => packages.filter((p) => p.category === cat)

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.sub}>
          <span className={styles.camera}>📷</span> PROFESSIONAL PHOTOGRAPHY
        </p>
        <h1 className={styles.title}>
          Capture Your <span className={styles.highlight}>Beautiful Moments</span>
        </h1>
        <p className={styles.tagline}>Book in just a few taps! 👆</p>
        <a href="#book" className={styles.heroCta}>
          Book Now
        </a>
      </section>

      <section id="packages" className={styles.packages}>
        <p className={styles.sub}>
          <span className={styles.camera}>📷</span> PACKAGES
        </p>
        <h2 className={styles.sectionTitle}>Choose Your Package</h2>

        {loading ? (
          <p className={styles.loading}>Loading packages...</p>
        ) : categories.length === 0 ? (
          <p className={styles.empty}>No packages available right now. Please try again later or contact us.</p>
        ) : (
          categories.map((cat) => (
            <div key={cat} className={styles.category}>
              <h3 className={styles.catTitle}>
                <span className={styles.bullet}>•</span> {cat}
              </h3>
              <div className={styles.grid}>
                {byCategory(cat).map((pkg) => (
                  <div key={pkg.id} className={styles.cardWrap}>
                    <PackageCard
                      id={pkg.id}
                      name={pkg.name}
                      price={pkg.price}
                      currency={pkg.currency}
                      popular={pkg.popular}
                      features={pkg.features}
                      onSelect={handleSelectPackage}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </section>

      <section id="book" className={styles.bookSection}>
        <BookingForm showHeading={true} initialPackageId={selectedPackageId} />
      </section>
    </div>
  )
}
