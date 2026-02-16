import styles from './PackageCard.module.css'

export default function PackageCard({ id, name, price, currency, popular, features, onSelect }) {
  const handleClick = () => {
    if (onSelect && id) onSelect(id)
  }

  return (
    <article
      className={styles.card}
      onClick={onSelect ? handleClick : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick() } } : undefined}
    >
      {popular && (
        <div className={styles.badge}>
          <span className={styles.star}>★</span> Popular
        </div>
      )}
      <h3 className={styles.name}>{name}</h3>
      <p className={styles.price}>
        <span className={styles.amount}>{price?.toLocaleString()}</span>{' '}
        <span className={styles.currency}>{currency}</span>
      </p>
      <ul className={styles.features}>
        {features?.map((f, i) => (
          <li key={i}>
            <span className={styles.check}>✓</span> {f}
          </li>
        ))}
      </ul>
    </article>
  )
}
