import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import styles from './ContactUs.module.css';

export default function ContactUs() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>

        <Link to="/" className={styles.backButton}>
          <ArrowLeft size={18} />
          Back
        </Link>

        <h1 className={styles.title}>Contact Us</h1>

        <p className={styles.subtitle}>
          Feel free to contact us for any query or feedback.
        </p>

        <form className={styles.form}>
          <input
            type="text"
            placeholder="Your Name"
            className={styles.input}
          />

          <input
            type="email"
            placeholder="Your Email"
            className={styles.input}
          />

          <input
            type="text"
            placeholder="Subject"
            className={styles.input}
          />

          <textarea
            placeholder="Your Message"
            rows="5"
            className={styles.textarea}
          />

          <button type="submit" className={styles.btnPrimary}>
            Send Message
          </button>
        </form>

      </div>
    </div>
  );
}