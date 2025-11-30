import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SystemStatus } from '../SystemStatus';

describe('SystemStatus', () => {
  it('should render primary route status when isPrimary is true', () => {
    render(<SystemStatus isPrimary={true} state="MONITORING" />);

    expect(screen.getByText('PRIMARY (GCP Cloud Run)')).toBeInTheDocument();
    expect(screen.getByText('Active DNS Route')).toBeInTheDocument();
  });

  it('should render secondary route status when isPrimary is false', () => {
    render(<SystemStatus isPrimary={false} state="MONITORING" />);

    expect(screen.getByText('SECONDARY (AWS Failover)')).toBeInTheDocument();
  });

  it('should display the current sentinel state', () => {
    render(<SystemStatus isPrimary={true} state="ANALYZING" />);

    expect(screen.getByText('ANALYZING')).toBeInTheDocument();
  });

  it('should display all sentinel states correctly', () => {
    const states = ['IDLE', 'MONITORING', 'ANALYZING', 'REMEDIATING', 'RECOVERED'] as const;

    states.forEach(state => {
      const { unmount } = render(<SystemStatus isPrimary={true} state={state} />);
      expect(screen.getByText(state)).toBeInTheDocument();
      unmount();
    });
  });

  it('should show "24h ago" for last DNS update when on primary', () => {
    render(<SystemStatus isPrimary={true} state="MONITORING" />);

    expect(screen.getByText('24h ago')).toBeInTheDocument();
  });

  it('should show "Just now" for last DNS update when on secondary', () => {
    render(<SystemStatus isPrimary={false} state="MONITORING" />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should render operational status section', () => {
    render(<SystemStatus isPrimary={true} state="MONITORING" />);

    expect(screen.getByText('Operational Status')).toBeInTheDocument();
  });

  it('should render last DNS update section', () => {
    render(<SystemStatus isPrimary={true} state="MONITORING" />);

    expect(screen.getByText('Last DNS Update')).toBeInTheDocument();
  });
});
