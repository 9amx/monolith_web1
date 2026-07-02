'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './DatePicker.module.css';

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function DatePicker({ value, onChange, placeholder = 'Select Date' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const initialDate = value ? new Date(value + 'T00:00:00') : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  useEffect(() => {
    if (isOpen) {
      const activeDate = value ? new Date(value + 'T00:00:00') : new Date();
      setCurrentMonth(new Date(activeDate.getFullYear(), activeDate.getMonth(), 1));
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const handleSelect = (day) => {
    const selectedDate = new Date(year, month, day);
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => (
    <div key={`blank-${i}`} className={styles.dayCellEmpty} />
  ));

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isSelected = value === dateStr;
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    return (
      <button
        key={`day-${day}`}
        type="button"
        className={`${styles.dayCell} ${isSelected ? styles.selected : ''} ${isToday && !isSelected ? styles.today : ''}`}
        onClick={() => handleSelect(day)}
      >
        {day}
      </button>
    );
  });

  let displayValue = placeholder;
  if (value) {
    const d = new Date(value + 'T00:00:00');
    displayValue = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
  }

  return (
    <div className={styles.container} ref={containerRef}>
      <button 
        type="button" 
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{displayValue}</span>
        <CalendarIcon size={16} style={{ opacity: 0.5 }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.popover}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            data-lenis-prevent="true"
          >
            <div className={styles.header}>
              <button type="button" className={styles.navButton} onClick={prevMonth}>
                <ChevronLeft size={16} />
              </button>
              <div className={styles.monthLabel}>
                {MONTHS[month]} {year}
              </div>
              <button type="button" className={styles.navButton} onClick={nextMonth}>
                <ChevronRight size={16} />
              </button>
            </div>

            <div className={styles.grid}>
              {DAYS.map(d => (
                <div key={d} className={styles.dayName}>{d}</div>
              ))}
              {blanks}
              {dayCells}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
