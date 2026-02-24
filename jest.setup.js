// jest.setup.js
require('@testing-library/jest-dom');

// Global mocks
global.React = require('react');
global.BACKEND_URL = 'http://localhost:8000';
global.fetch = jest.fn();
