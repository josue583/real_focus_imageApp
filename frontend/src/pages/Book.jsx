import { useNavigate } from 'react-router-dom'
import BookingForm from '../components/BookingForm'
import styles from './Book.module.css'

export default function Book() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <BookingForm
        showHeading={true}
        onSuccess={() => navigate('/')}
      />
    </div>
  )
}
