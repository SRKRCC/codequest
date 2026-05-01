import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FeatureCard } from '../feature-card';
import { Code } from 'lucide-react';

describe('FeatureCard', () => {
  const defaultProps = {
    icon: <Code data-testid="icon" />,
    title: 'Test Feature',
    description: 'This is a test description for the feature card.',
  };

  it('renders without crashing', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(document.body.innerHTML).not.toBe('');
  });

  it('displays the title correctly', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('Test Feature')).toBeInTheDocument();
  });

  it('displays the description correctly', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText('This is a test description for the feature card.')).toBeInTheDocument();
  });

  it('renders the icon', () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders with different props', () => {
    const customProps = {
      icon: <span data-testid="custom-icon">🚀</span>,
      title: 'Custom Title',
      description: 'Custom description text',
    };
    
    render(<FeatureCard {...customProps} />);
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom description text')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('contains proper heading structure', () => {
    render(<FeatureCard {...defaultProps} />);
    
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading).toHaveTextContent('Test Feature');
  });
});
