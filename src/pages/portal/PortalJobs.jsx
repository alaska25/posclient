import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export default function PortalJobs() {
  const { data, isLoading } = useQuery({
    queryKey: ['portal-jobs'],
    queryFn: () => api.get('/jobs/my').then(r => r.data),
  });

  if (isLoading) return <div className="text-muted">Loading…</div>;

  const jobs = data?.data ?? [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Work Orders</h1>
      </div>
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Job #</th>
                <th>Description</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job._id}>
                  <td className="mono">{job.jobNumber}</td>
                  <td>{job.description || '—'}</td>
                  <td>{job.status}</td>
                  <td className="text-muted">{job.dueDate ? new Date(job.dueDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {!jobs.length && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>
                    No work orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}