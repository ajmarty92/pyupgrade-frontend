const React = require('react');
const ReactDOM = require('react-dom');
const { TextEncoder, TextDecoder } = require('util');

global.React = React;
global.ReactDOM = ReactDOM;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.BACKEND_URL = 'http://test-backend';

require('@testing-library/jest-dom');

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
  })
);
