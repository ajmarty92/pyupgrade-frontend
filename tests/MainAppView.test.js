import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MainAppView from '../js/MainAppView';

// Since MainAppView.js assumes global components, we must provide them globally for the test environment.
// Ideally, we would import them and use dependency injection, but to match the browser environment structure:

global.ServerCrash = () => <div data-testid="server-crash-icon">ServerCrash</div>;
global.LogOut = ({ className }) => <div data-testid="logout-icon" className={className}>Logout</div>;

// Mock the view components globally
global.RepoSelectionView = ({ onScan }) => (
    <div data-testid="repo-selection-view">
        <button onClick={() => onScan('test/repo')}>Scan test/repo</button>
    </div>
);
global.ScanningView = () => <div data-testid="scanning-view">Scanning...</div>;
global.ReportView = ({ onNewScan }) => (
    <div data-testid="report-view">
        <button onClick={onNewScan}>New Scan</button>
    </div>
);

describe('MainAppView', () => {
    beforeEach(() => {
        fetch.mockClear();
        // Reset fetch to a default successful response to avoid unhandled rejections in mounting
        fetch.mockResolvedValue({
            ok: true,
            json: async () => []
        });
    });

    test('fetches repositories on mount and renders RepoSelectionView', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, full_name: 'test/repo', name: 'repo', owner: { login: 'test' } }]
        });

        await act(async () => {
            render(<MainAppView onLogout={jest.fn()} />);
        });

        expect(fetch).toHaveBeenCalledWith(`${global.BACKEND_URL}/api/repositories`, expect.anything());
        expect(screen.getByTestId('repo-selection-view')).toBeInTheDocument();
    });

    test('handles scan start and transitions to ScanningView', async () => {
        // Mount
        await act(async () => {
            render(<MainAppView onLogout={jest.fn()} />);
        });

        // Prepare scan response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ task_id: '123' })
        });

        // Click scan
        await act(async () => {
            fireEvent.click(screen.getByText('Scan test/repo'));
        });

        expect(screen.getByTestId('scanning-view')).toBeInTheDocument();
        expect(fetch).toHaveBeenCalledWith(`${global.BACKEND_URL}/api/scan`, expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ repo_name: 'test/repo' })
        }));
    });

    test('polls for scan status and transitions to ReportView on success', async () => {
        jest.useFakeTimers();

        await act(async () => {
            render(<MainAppView onLogout={jest.fn()} />);
        });

        // Scan start response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ task_id: '123' })
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Scan test/repo'));
        });

        // Mock Poll response: Success
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'SUCCESS', result: { repoName: 'test/repo', summary: 'Good', dependencies: [], syntaxIssues: [], recommendations: { steps: [] } } })
        });

        // Advance timer to trigger poll
        await act(async () => {
            jest.advanceTimersByTime(3000);
        });

        expect(fetch).toHaveBeenCalledWith(`${global.BACKEND_URL}/api/scan/status/123`, expect.anything());
        expect(screen.getByTestId('report-view')).toBeInTheDocument();

        jest.useRealTimers();
    });

    test('handles fetch error display', async () => {
        fetch.mockRejectedValueOnce(new Error('Network Error'));

        await act(async () => {
            render(<MainAppView onLogout={jest.fn()} />);
        });

        expect(screen.getByTestId('server-crash-icon')).toBeInTheDocument();
        expect(screen.getByText('Network Error')).toBeInTheDocument();
    });

    test('calls onLogout when logout button is clicked', async () => {
        const onLogout = jest.fn();
        await act(async () => {
            render(<MainAppView onLogout={onLogout} />);
        });

        // Use getByRole to specifically target the button, which handles nested text
        fireEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(onLogout).toHaveBeenCalled();
    });
});
