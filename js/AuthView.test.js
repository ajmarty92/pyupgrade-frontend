const React = require('react');
const { render, screen, fireEvent, waitFor } = require('@testing-library/react');
require('@testing-library/jest-dom');

// Mock global variables and components
global.React = React;
global.BACKEND_URL = 'http://test-backend';

// Load Icons and put them in global scope
const Icons = require('./Icons');
Object.assign(global, Icons);

// Now load AuthView
const AuthView = require('./AuthView');

// Mock fetch
global.fetch = jest.fn();

describe('AuthView', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form by default', () => {
        render(<AuthView onLoginSuccess={jest.fn()} initialAction="login" />);
        expect(screen.getByText('Sign In', { selector: 'h2' })).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();

        // Check for the submit button
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();

        // Check for the switch button
        expect(screen.getByText("Don't have account?")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
    });

    test('renders signup form when initialAction is signup', () => {
        render(<AuthView onLoginSuccess={jest.fn()} initialAction="signup" />);
        expect(screen.getByText('Create Account', { selector: 'h2' })).toBeInTheDocument();

        // Check for the submit button
        expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();

        // Check for the switch button
        expect(screen.getByText("Have account?")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    test('switches between login and signup', () => {
        render(<AuthView onLoginSuccess={jest.fn()} initialAction="login" />);

        // Switch to signup
        const signUpSwitch = screen.getByRole('button', { name: 'Sign Up' });
        fireEvent.click(signUpSwitch);

        expect(screen.getByText('Create Account', { selector: 'h2' })).toBeInTheDocument();

        // Switch back to login
        const signInSwitch = screen.getByRole('button', { name: 'Sign In' });
        fireEvent.click(signInSwitch);

        expect(screen.getByText('Sign In', { selector: 'h2' })).toBeInTheDocument();
    });

    test('handles login success', async () => {
        const onLoginSuccess = jest.fn();
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'fake-token' }),
        });

        render(<AuthView onLoginSuccess={onLoginSuccess} initialAction="login" />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });

        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        fireEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledWith('http://test-backend/auth/login', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'test@example.com', password: 'password123', provider: 'email' })
        }));

        await waitFor(() => expect(onLoginSuccess).toHaveBeenCalled());
    });

    test('handles login failure', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ detail: 'Invalid credentials' }),
        });

        render(<AuthView onLoginSuccess={jest.fn()} initialAction="login" />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });

        const submitButton = screen.getByRole('button', { name: 'Sign In' });
        fireEvent.click(submitButton);

        await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
    });

    test('handles signup success', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User created' }),
        });

        render(<AuthView onLoginSuccess={jest.fn()} initialAction="signup" />);

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'new@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'newpass' } });

        const submitButton = screen.getByRole('button', { name: 'Sign Up' });
        fireEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledWith('http://test-backend/auth/signup', expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ email: 'new@example.com', password: 'newpass', provider: 'email' })
        }));

        // Expect to switch to login view (Sign In header)
        await waitFor(() => expect(screen.getByText('Sign In', { selector: 'h2' })).toBeInTheDocument());
    });
});
