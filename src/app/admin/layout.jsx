'use client';
import AdminRoute from '../../components/admin/AdminRoute';
import TradeLayout from '../../layouts/TradeLayout';
import React from 'react';

export default function AdminLayout({ children }) {
  return (
    <AdminRoute>
      <TradeLayout>
        {children}
      </TradeLayout>
    </AdminRoute>
  );
}
