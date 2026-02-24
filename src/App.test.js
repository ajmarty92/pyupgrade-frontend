const { render, screen, waitFor, act } = require("@testing-library/react");
const React = require("react");
require("@testing-library/jest-dom");

// Setup for App component
// We need to require App.js to execute it and register window.App
// But we need to make sure global.React is set before require.
// jest.setup.js handles global.React.

describe("App", () => {
  let App;

  beforeAll(() => {
    // Require the file only once
    require("./App");
    App = window.App;
  });

  beforeEach(() => {
    fetch.mockClear();
  });

  test("shows loading state initially", async () => {
    // Mock fetch to never resolve to simulate loading
    fetch.mockImplementation(() => new Promise(() => {}));

    // We render inside act
    // Note: Since the promise never resolves, we just check the initial render
    let container;
    await act(async () => {
      const result = render(React.createElement(App));
      container = result.container;
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("shows AuthView when not logged in", async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    });

    await act(async () => {
      render(React.createElement(App));
    });

    await waitFor(() => {
      // Check for Sign In text which is in AuthView
      // Use getAllByText because "Sign In" appears in header and button
      const signInElements = screen.getAllByText(/Sign In/i);
      expect(signInElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/Logout/i)).not.toBeInTheDocument();
    });
  });

  test("shows MainAppView when logged in", async () => {
    // Mock login check
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    // Mock repositories call which happens after login in MainAppView
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    });

    await act(async () => {
      render(React.createElement(App));
    });

    await waitFor(() => {
      expect(screen.getByText(/Logout/i)).toBeInTheDocument();
      // AuthView should not be visible
      // "Sign In" might be in other places? No, AuthView has "Sign In" button.
      // But MainAppView has "Logout".
      // Let's check for specific elements of MainAppView vs AuthView
      expect(screen.queryByPlaceholderText(/Email/i)).not.toBeInTheDocument();
    });
  });
});
