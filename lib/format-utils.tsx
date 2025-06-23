import React, { ReactNode } from 'react';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(value);
}

function formatDate(value: string): string {
  try {
    return new Date(value).toLocaleDateString('ja-JP');
  } catch {
    return value;
  }
}

function formatStatus(value: string): ReactNode {
  const statusClasses = {
    '進行中': 'bg-blue-100 text-blue-800',
    '完了': 'bg-green-100 text-green-800',
    '計画中': 'bg-yellow-100 text-yellow-800',
  };
  const className = statusClasses[value as keyof typeof statusClasses] || 'bg-gray-100 text-gray-800';
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {value}
    </span>
  );
}

export function defaultFormatValue(value: unknown, column: string): ReactNode {
  if (value === null || value === undefined) return '-';
  
  // Format salary/budget as currency
  if ((column === 'salary' || column === 'budget') && typeof value === 'number') {
    return formatCurrency(value);
  }
  
  // Format date columns
  if (column.includes('date') && typeof value === 'string') {
    return formatDate(value);
  }
  
  // Format status with badge
  if (column === 'status' && typeof value === 'string') {
    return formatStatus(value);
  }
  
  return String(value);
}

