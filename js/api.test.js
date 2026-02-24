import { fetchStrategicSummary } from './api';

describe('fetchStrategicSummary', () => {
    const mockBackendUrl = 'http://test-backend';
    const mockSummary = '<p>This is a summary</p>';

    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('successfully fetches and returns strategic summary', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ summary: mockSummary }),
        });

        const result = await fetchStrategicSummary(mockBackendUrl);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith(
            `${mockBackendUrl}/api/strategic-summary`,
            { credentials: 'include' }
        );
        expect(result).toBe(mockSummary);
    });

    test('throws error when response is not ok', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: false,
        });

        await expect(fetchStrategicSummary(mockBackendUrl)).rejects.toThrow('Failed to generate summary.');
    });

    test('throws error when network fails', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        await expect(fetchStrategicSummary(mockBackendUrl)).rejects.toThrow('Network error');
    });
});
