import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyStateOverlay } from '../components/EmptyStateOverlay';

describe('EmptyStateOverlay', () => {
  it('renders the empty state message', () => {
    render(<EmptyStateOverlay />);
    
    expect(screen.getByText('No Results to Display')).toBeInTheDocument();
    expect(screen.getByText('Apply filters to load data for this grid')).toBeInTheDocument();
  });
  
  it('does not render the filter button when onFilterClick is not provided', () => {
    render(<EmptyStateOverlay />);
    
    expect(screen.queryByText('Open Filters')).not.toBeInTheDocument();
  });
  
  it('renders the filter button when onFilterClick is provided', () => {
    render(<EmptyStateOverlay onFilterClick={() => {}} />);
    
    expect(screen.getByText('Open Filters')).toBeInTheDocument();
  });
  
  it('calls onFilterClick when the filter button is clicked', () => {
    const handleFilterClick = jest.fn();
    render(<EmptyStateOverlay onFilterClick={handleFilterClick} />);
    
    fireEvent.click(screen.getByText('Open Filters'));
    
    expect(handleFilterClick).toHaveBeenCalledTimes(1);
  });
});