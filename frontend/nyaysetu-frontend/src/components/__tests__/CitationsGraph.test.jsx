import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CitationsGraph from '../CitationsGraph';

describe('CitationsGraph Component', () => {
  it('renders the component header and SVG visualization', () => {
    render(<CitationsGraph />);
    expect(screen.getByText('Citations Network Graph')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search case laws or topics...')).toBeInTheDocument();
    expect(screen.getByLabelText('Citations Network Visualization Graph')).toBeInTheDocument();
  });

  it('filters nodes based on search input', () => {
    render(<CitationsGraph />);
    const searchInput = screen.getByPlaceholderText('Search case laws or topics...');
    fireEvent.change(searchInput, { target: { value: 'Kesavananda' } });
    expect(screen.getByText('Kesavananda Bharati v. State of Kerala')).toBeInTheDocument();
  });

  it('handles zoom level state updates', () => {
    render(<CitationsGraph />);
    const zoomInBtn = screen.getByTitle('Zoom In');
    const zoomOutBtn = screen.getByTitle('Zoom Out');
    const resetBtn = screen.getByTitle('Reset View');

    fireEvent.click(zoomInBtn);
    fireEvent.click(zoomOutBtn);
    fireEvent.click(resetBtn);

    expect(screen.getByText('Citations Network Graph')).toBeInTheDocument();
  });
});
