// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignupFormComponent } from '@/components/NavBar/SignupFormComponent';

describe('SignupFormComponent - Paused Account Creation & Theme Contrast', () => {
  it('renders paused account creation state with dark theme contrast classes when isDarkTheme is true', () => {
    const onBackToLogin = vi.fn();
    render(
      <SignupFormComponent
        accountCreationEnabled={false}
        isDarkTheme={true}
        onBackToLogin={onBackToLogin}
      />
    );

    const heading = screen.getByRole('heading', { level: 5, name: /Account Creation is Currently Disabled/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('text-white');
    expect(heading.className).not.toContain('text-dark');

    const desc = screen.getByText(/We are temporarily pausing new user registrations/i);
    expect(desc).toBeInTheDocument();
    expect(desc.className).toContain('text-white-50');

    const alertBox = screen.getByText(/Existing Users & Invited Teachers/i).closest('.alert');
    expect(alertBox).toBeInTheDocument();
    expect(alertBox.className).toContain('text-light');

    const alertHeading = screen.getByText(/Existing Users & Invited Teachers/i);
    expect(alertHeading.className).toContain('text-warning');

    const alertBody = screen.getByText(/If you already have an account or received an invitation link, you can log in./i);
    expect(alertBody.className).toContain('text-light');

    const backButton = screen.getByRole('button', { name: /Back to Sign In/i });
    fireEvent.click(backButton);
    expect(onBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('renders paused account creation state with light theme classes when isDarkTheme is false', () => {
    const onBackToLogin = vi.fn();
    render(
      <SignupFormComponent
        accountCreationEnabled={false}
        isDarkTheme={false}
        onBackToLogin={onBackToLogin}
      />
    );

    const heading = screen.getByRole('heading', { level: 5, name: /Account Creation is Currently Disabled/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('text-dark');
    expect(heading.className).not.toContain('text-white');

    const alertHeading = screen.getByText(/Existing Users & Invited Teachers/i);
    expect(alertHeading.className).toContain('text-dark');
  });

  it('renders standard signup form when accountCreationEnabled is true', () => {
    render(
      <SignupFormComponent
        accountCreationEnabled={true}
        isDarkTheme={true}
        onBackToLogin={vi.fn()}
      />
    );

    expect(screen.getByPlaceholderText(/e\.g\. Dr\. Sarah Jenkins/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/name@school\.edu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });
});

