import { useEffect, useState } from 'react'
import styles from './BookingForm.module.css'

const API = '/api'

export default function BookingForm({ onSuccess, showHeading = true, initialPackageId = '' }) {
  const [packages, setPackages] = useState([])
  const [form, setForm] = useState({
    packageId: '',
    name: '',
    email: '',
    whatsapp: '',
    date: '',
    time: '',
    notes: '',
  })
  const [total, setTotal] = useState(null)
  const [preview, setPreview] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetch(API + '/packages')
      .then((res) => res.json())
      .then(setPackages)
      .catch(() => setPackages([]))
  }, [])

  useEffect(() => {
    if (initialPackageId && packages.some((p) => p.id === initialPackageId)) {
      setForm((prev) => ({ ...prev, packageId: initialPackageId }))
    }
  }, [initialPackageId, packages])

  const selectedPackage = packages.find((p) => p.id === form.packageId)

  useEffect(() => {
    if (selectedPackage) setTotal(selectedPackage.price)
    else setTotal(null)
  }, [selectedPackage])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (preview) {
      setSubmitting(true)
      fetch(API + '/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: form.packageId,
          name: form.name,
          email: form.email || undefined,
          whatsapp: form.whatsapp || undefined,
          date: form.date,
          time: form.time || undefined,
          notes: form.notes?.slice(0, 2000) || undefined,
        }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Booking failed')
          return res.json()
        })
        .then(() => {
          alert('Booking submitted successfully! We will contact you soon.')
          onSuccess?.()
        })
        .catch(() => alert('Something went wrong. Please try again.'))
        .finally(() => setSubmitting(false))
    } else {
      setPreview(true)
    }
  }

  return (
    <div className={styles.wrap}>
      {showHeading && (
        <div className={styles.head}>
          <p className={styles.sub}>📅 BOOK NOW</p>
          <h2 className={styles.title}>
            Book Your <span className={styles.highlight}>Session</span>
          </h2>
          <p className={styles.intro}>Fill in the form below to request your photography session. We’ll get back to you to confirm.</p>
        </div>
      )}
      <div className={styles.body}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label}>
            <span className={styles.icon}>📷</span> Select Package *
          </label>
          <select
            name="packageId"
            value={form.packageId}
            onChange={handleChange}
            className={styles.input}
            required
          >
            <option value="">Tap to choose...</option>
            {packages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.price.toLocaleString()} {p.currency}
              </option>
            ))}
          </select>

          <label className={styles.label}>
            <span className={styles.icon}>👤</span> Your Name *
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            className={styles.input}
            required
          />

          <label className={styles.label}>
            <span className={styles.icon}>✉️</span> Email (optional)
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@email.com"
            className={styles.input}
          />

          <label className={styles.label}>
            <span className={styles.icon}>💬</span> WhatsApp Number (optional)
          </label>
          <input
            type="tel"
            name="whatsapp"
            value={form.whatsapp}
            onChange={handleChange}
            placeholder="+250 7XX XXX XXX"
            className={styles.input}
          />

          <div className={styles.row}>
            <div className={styles.half}>
              <label className={styles.label}>
                <span className={styles.icon}>📅</span> Date *
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.half}>
              <label className={styles.label}>
                <span className={styles.icon}>🕐</span> Time
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <label className={styles.label}>
            Notes (optional) max 2000 chars
          </label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            placeholder="Any special requests..."
            className={styles.textarea}
            maxLength={2000}
            rows={4}
          />

          <div className={styles.totalBar}>
            <span>Total</span>
            <span>
              {total != null ? `${total.toLocaleString()} RWF` : '--- RWF'}
            </span>
          </div>

          <button
            type="submit"
            className={styles.submit}
            disabled={submitting || !form.packageId || !form.name || !form.date}
          >
            <span className={styles.eye}>👁</span> {preview && !submitting ? 'Confirm & Send' : preview && submitting ? 'Sending...' : 'Preview & Confirm'}
          </button>
          <p className={styles.hint}>Review your booking before sending</p>
        </form>
      </div>
    </div>
  )
}
