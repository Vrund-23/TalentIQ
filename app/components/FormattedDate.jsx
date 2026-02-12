'use client';

import { useEffect, useState } from 'react';

export default function FormattedDate({ date, format = 'date', className = '' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>...</span>;
  }

  const d = new Date(date);
  
  let formatted = '';
  if (format === 'date') {
    formatted = d.toLocaleDateString();
  } else if (format === 'time') {
    formatted = d.toLocaleTimeString();
  } else if (format === 'datetime') {
    formatted = d.toLocaleString();
  } else if (format === 'relative') {
      const now = new Date();
      const diff = now - d;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) formatted = `${days} days ago`;
      else if (hours > 0) formatted = `${hours} hours ago`;
      else if (minutes > 0) formatted = `${minutes} mins ago`;
      else formatted = 'Just now';
  }

  return <span suppressHydrationWarning className={className}>{formatted}</span>;
}
