import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './Admin.module.css'

const API = '/api'
const ADMIN_KEY = 'adminPassword'

function getAdminPassword() {
  try {
    return sessionStorage.getItem(ADMIN_KEY) || ''
  } catch {
    return ''
  }
}

export default function Admin() {
  const [isOwner, setIsOwner] = useState(() => !!getAdminPassword())
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [gallery, setGallery] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [changePass, setChangePass] = useState({ current: '', new: '', confirm: '' })
  const [changePassError, setChangePassError] = useState('')
  const [changePassLoading, setChangePassLoading] = useState(false)
  const [changePassSuccess, setChangePassSuccess] = useState(false)

  const loadGallery = () => {
    fetch(API + '/gallery')
      .then((res) => res.json())
      .then(setGallery)
      .catch(() => setGallery([]))
  }

  useEffect(() => {
    if (isOwner) loadGallery()
  }, [isOwner])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!password.trim()) return
    setLoginLoading(true)
    setLoginError('')
    fetch(API + '/admin/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.trim() }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Invalid password')
        return res.json()
      })
      .then(() => {
        sessionStorage.setItem(ADMIN_KEY, password.trim())
        setIsOwner(true)
        setPassword('')
      })
      .catch(() => setLoginError('Invalid password. Only the studio owner can access this page.'))
      .finally(() => setLoginLoading(false))
  }

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_KEY)
    setIsOwner(false)
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setChangePassError('')
    if (changePass.new !== changePass.confirm) {
      setChangePassError('New password and confirm password do not match.')
      return
    }
    if (changePass.new.length < 4) {
      setChangePassError('New password must be at least 4 characters.')
      return
    }
    setChangePassLoading(true)
    fetch(API + '/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword: changePass.current,
        newPassword: changePass.new,
      }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Failed to change password')
        return data
      })
      .then(() => {
        setChangePassSuccess(true)
        setChangePass({ current: '', new: '', confirm: '' })
        setTimeout(() => {
          sessionStorage.removeItem(ADMIN_KEY)
          setIsOwner(false)
          setShowChangePassword(false)
          setChangePassSuccess(false)
        }, 2000)
      })
      .catch((err) => setChangePassError(err.message || 'Failed to change password'))
      .finally(() => setChangePassLoading(false))
  }

  const adminHeaders = () => ({
    'X-Admin-Password': getAdminPassword(),
  })

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (f && f.type.startsWith('image/')) setFile(f)
    else setFile(null)
  }

  const handleUpload = (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('image', file)
    if (title.trim()) form.append('title', title.trim())
    fetch(API + '/upload', {
      method: 'POST',
      headers: adminHeaders(),
      body: form,
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized. Please log in again.')
        if (!res.ok) throw new Error('Upload failed')
        return res.json()
      })
      .then(() => {
        setFile(null)
        setTitle('')
        document.getElementById('admin-file').value = ''
        loadGallery()
      })
      .catch((err) => alert(err.message || 'Upload failed. Try again.'))
      .finally(() => setUploading(false))
  }

  const handleDelete = (id) => {
    if (!confirm('Remove this image from the gallery?')) return
    setDeleting(id)
    fetch(API + '/gallery/' + id, {
      method: 'DELETE',
      headers: adminHeaders(),
    })
      .then((res) => {
        if (res.status === 401) throw new Error('Unauthorized. Please log in again.')
        if (!res.ok) throw new Error('Delete failed')
        loadGallery()
      })
      .catch((err) => alert(err.message || 'Delete failed.'))
      .finally(() => setDeleting(null))
  }

  if (!isOwner) {
    return (
      <div className={styles.page}>
        <div className={styles.loginBox}>
          <p className={styles.sub}>🔐 Studio owner only</p>
          <h1 className={styles.title}>Admin login</h1>
          <p className={styles.desc}>
            Only the owner of Real Focus Image can upload or remove advertising images. Enter your password to continue.
          </p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className={styles.input}
              autoComplete="current-password"
              disabled={loginLoading}
            />
            {loginError && <p className={styles.loginError}>{loginError}</p>}
            <button type="submit" className={styles.submit} disabled={loginLoading}>
              {loginLoading ? 'Checking...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <p className={styles.sub}>🖼 ADMIN</p>
        <h1 className={styles.title}>
          Upload <span className={styles.highlight}>Advertising</span> Images
        </h1>
        <p className={styles.desc}>
          As the studio owner, you can add or remove pictures that advertise Real Focus Image. They appear on the <Link to="/gallery">Gallery</Link> for visitors.
        </p>
        <button type="button" onClick={handleLogout} className={styles.logout}>
          Log out
        </button>
      </div>

      <section className={styles.changePassSection}>
        <button
          type="button"
          className={styles.changePassToggle}
          onClick={() => {
            setShowChangePassword((v) => !v)
            setChangePassError('')
            setChangePassSuccess(false)
          }}
        >
          {showChangePassword ? '▼ Hide' : '▶ Change password'}
        </button>
        {showChangePassword && (
          <form onSubmit={handleChangePassword} className={styles.changePassForm}>
            <p className={styles.changePassDesc}>
              Enter your current password and choose a new one. You will be logged out and must sign in again with the new password.
            </p>
            <label className={styles.label}>Current password</label>
            <input
              type="password"
              value={changePass.current}
              onChange={(e) => setChangePass((p) => ({ ...p, current: e.target.value }))}
              placeholder="Current password"
              className={styles.input}
              autoComplete="current-password"
              required
            />
            <label className={styles.label}>New password</label>
            <input
              type="password"
              value={changePass.new}
              onChange={(e) => setChangePass((p) => ({ ...p, new: e.target.value }))}
              placeholder="At least 4 characters"
              className={styles.input}
              autoComplete="new-password"
              minLength={4}
              required
            />
            <label className={styles.label}>Confirm new password</label>
            <input
              type="password"
              value={changePass.confirm}
              onChange={(e) => setChangePass((p) => ({ ...p, confirm: e.target.value }))}
              placeholder="Same as new password"
              className={styles.input}
              autoComplete="new-password"
              required
            />
            {changePassError && <p className={styles.loginError}>{changePassError}</p>}
            {changePassSuccess && <p className={styles.changePassSuccess}>Password changed. Logging you out…</p>}
            <button type="submit" className={styles.submit} disabled={changePassLoading}>
              {changePassLoading ? 'Updating...' : 'Update password'}
            </button>
          </form>
        )}
      </section>

      <form className={styles.form} onSubmit={handleUpload}>
        <label className={styles.label}>Choose image *</label>
        <input
          id="admin-file"
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFile}
          className={styles.fileInput}
        />
        <label className={styles.label}>Caption (optional)</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Short description"
          className={styles.input}
        />
        <button
          type="submit"
          className={styles.submit}
          disabled={!file || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload image'}
        </button>
      </form>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Current gallery – only you can remove images</h2>
        {gallery.length === 0 ? (
          <p className={styles.empty}>No images yet. Upload above.</p>
        ) : (
          <div className={styles.grid}>
            {gallery.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img
                    src={item.url}
                    alt={item.title || item.filename}
                    className={styles.img}
                  />
                </div>
                {item.title && <p className={styles.caption}>{item.title}</p>}
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? 'Removing...' : 'Remove'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
