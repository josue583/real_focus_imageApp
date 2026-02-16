import { useEffect, useState } from 'react'
import styles from './Gallery.module.css'
import { API, API_BASE } from '../api'

const SLIDE_INTERVAL_MS = 5000

export default function Gallery() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [slideIndex, setSlideIndex] = useState(0)
  const [direction, setDirection] = useState(0)
  const [openImage, setOpenImage] = useState(null)

  useEffect(() => {
    setLoading(true)
    fetch(API + '/gallery')
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => {
      setDirection(1)
      setSlideIndex((i) => (i + 1) % items.length)
    }, SLIDE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [items.length])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setOpenImage(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const goTo = (nextIndex, dir) => {
    setDirection(dir)
    setSlideIndex(nextIndex)
  }

  const goPrev = () => {
    if (items.length === 0) return
    goTo((slideIndex - 1 + items.length) % items.length, -1)
  }

  const goNext = () => {
    if (items.length === 0) return
    goTo((slideIndex + 1) % items.length, 1)
  }

  const baseUrl = API_BASE

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <p className={styles.sub}>📷 GALLERY</p>
        <h1 className={styles.title}>
          Our <span className={styles.highlight}>Work</span>
        </h1>
        <p className={styles.desc}>
          Advertising and portfolio images from Real Focus Image. What we do in our studio.
        </p>
      </div>

      <div className={styles.body}>
        {loading ? (
          <p className={styles.loading}>Loading gallery...</p>
        ) : items.length === 0 ? (
          <p className={styles.empty}>No images yet.</p>
        ) : (
          <>
            <div className={styles.sliderWrap}>
              <div
                className={styles.sliderTrack}
                style={{
                  '--count': items.length,
                  '--index': slideIndex,
                  '--direction': direction,
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={styles.sliderSlide}
                    onClick={() => setOpenImage(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenImage(item) } }}
                    aria-label="View full size"
                  >
                    <img
                      src={baseUrl + item.url}
                      alt={item.title || item.filename}
                      className={styles.sliderImg}
                    />
                    {item.title && <p className={styles.sliderCaption}>{item.title}</p>}
                  </div>
                ))}
              </div>
              {items.length > 1 && (
                <>
                  <button
                    type="button"
                    className={styles.sliderBtnPrev}
                    onClick={goPrev}
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className={styles.sliderBtnNext}
                    onClick={goNext}
                    aria-label="Next image"
                  >
                    ›
                  </button>
                  <div className={styles.sliderDots}>
                    {items.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={i === slideIndex ? styles.sliderDotActive : styles.sliderDot}
                        onClick={() => goTo(i, i > slideIndex ? 1 : -1)}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <h2 className={styles.gridTitle}>All images</h2>
            <div className={styles.grid}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => setOpenImage(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpenImage(item) } }}
                  aria-label="View full size"
                >
                  <div className={styles.imgWrap}>
                    <img
                      src={baseUrl + item.url}
                      alt={item.title || item.filename}
                      className={styles.img}
                    />
                  </div>
                  {item.title && <p className={styles.caption}>{item.title}</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {openImage && (
        <div
          className={styles.lightbox}
          onClick={() => setOpenImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image view"
        >
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={() => setOpenImage(null)}
            aria-label="Close"
          >
            ×
          </button>
          <div
            className={styles.lightboxContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={baseUrl + openImage.url}
              alt={openImage.title || openImage.filename}
              className={styles.lightboxImg}
            />
            {openImage.title && <p className={styles.lightboxCaption}>{openImage.title}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
