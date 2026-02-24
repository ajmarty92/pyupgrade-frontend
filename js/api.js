export const fetchStrategicSummary = async (backendUrl) => {
    const response = await fetch(`${backendUrl}/api/strategic-summary`, { credentials: 'include' });
    if (!response.ok) throw new Error("Failed to generate summary.");
    const data = await response.json();
    return data.summary;
};
