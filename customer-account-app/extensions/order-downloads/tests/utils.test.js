import { describe, it, expect } from 'vitest';
import { parseDownloadUrl, parseLineItemDownload, extractDownloads } from '../src/utils.js';

// ---------------------------------------------------------------------------
// parseLineItemDownload
// ---------------------------------------------------------------------------

describe('parseLineItemDownload', () => {
  it('returns the URL from the _download_url customAttribute', () => {
    const item = {
      title: 'CTT Linux Course',
      customAttributes: [{ key: '_download_url', value: 'https://cdn.cttstore.com/linux.zip' }],
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'CTT Linux Course',
      url: 'https://cdn.cttstore.com/linux.zip',
    });
  });

  it('returns null when customAttributes is an empty array', () => {
    const item = { title: 'Physical Item', customAttributes: [] };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when customAttributes has no _download_url key', () => {
    const item = {
      title: 'Gift Card',
      customAttributes: [{ key: 'gift_note', value: 'Happy Birthday' }],
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when _download_url value is an empty string', () => {
    const item = {
      title: 'Blank URL',
      customAttributes: [{ key: '_download_url', value: '' }],
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when _download_url value is only whitespace', () => {
    const item = {
      title: 'Whitespace URL',
      customAttributes: [{ key: '_download_url', value: '   ' }],
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when customAttributes is undefined', () => {
    const item = { title: 'No Attrs' };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when the line item itself is null', () => {
    expect(parseLineItemDownload(null)).toBeNull();
  });

  it('returns null when customAttributes is not an array (null)', () => {
    const item = { title: 'Bad Data', customAttributes: null };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('ignores other attributes and returns only the _download_url value', () => {
    const item = {
      title: 'Windows Toolbox',
      customAttributes: [
        { key: 'color', value: 'blue' },
        { key: '_download_url', value: 'https://cdn.cttstore.com/toolbox.exe' },
        { key: 'size', value: 'large' },
      ],
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'Windows Toolbox',
      url: 'https://cdn.cttstore.com/toolbox.exe',
    });
  });

  it('returns the correct title from the line item', () => {
    const item = {
      title: 'CTT Pro Bundle',
      customAttributes: [{ key: '_download_url', value: 'https://cdn.cttstore.com/pro-bundle.zip' }],
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'CTT Pro Bundle',
      url: 'https://cdn.cttstore.com/pro-bundle.zip',
    });
  });
});

// ---------------------------------------------------------------------------
// extractDownloads
// ---------------------------------------------------------------------------

describe('extractDownloads', () => {
  it('filters out items with no download, keeps items with one', () => {
    const lineItems = [
      { title: 'Physical T-Shirt', customAttributes: [] },
      {
        title: 'Linux Pro Course',
        customAttributes: [{ key: '_download_url', value: 'https://cdn.cttstore.com/linux-pro.zip' }],
      },
    ];
    expect(extractDownloads(lineItems)).toEqual([
      { title: 'Linux Pro Course', url: 'https://cdn.cttstore.com/linux-pro.zip' },
    ]);
  });

  it('returns all downloadable items from a multi-item order', () => {
    const lineItems = [
      {
        title: 'Course A',
        customAttributes: [{ key: '_download_url', value: 'https://cdn.cttstore.com/a.zip' }],
      },
      {
        title: 'Course B',
        customAttributes: [{ key: '_download_url', value: 'https://cdn.cttstore.com/b.zip' }],
      },
    ];
    expect(extractDownloads(lineItems)).toEqual([
      { title: 'Course A', url: 'https://cdn.cttstore.com/a.zip' },
      { title: 'Course B', url: 'https://cdn.cttstore.com/b.zip' },
    ]);
  });

  it('returns an empty array when no items have downloads', () => {
    const lineItems = [
      { title: 'Sticker Pack', customAttributes: [] },
      { title: 'Mug', customAttributes: [{ key: 'engraving', value: 'Chris' }] },
    ];
    expect(extractDownloads(lineItems)).toEqual([]);
  });

  it('returns an empty array for an empty line items list', () => {
    expect(extractDownloads([])).toEqual([]);
  });
});


describe('download URL security', () => {
  it.each([
    'javascript:alert(1)', 'data:text/html,<script>alert(1)</script>',
    'http://example.com/file', 'httpx://example.com/file', '//example.com/file',
    'https://user:pass@example.com/file', 'https://',
    'https://example.com/\\evil', 'https://example.com/\nfile',
    '{"url":42}', '{"url":"javascript:alert(1)"}', '["javascript:alert(1)"]',
    'null', '42', '{}', null,
  ])('rejects unsafe or malformed value %j', (value) => {
    expect(parseDownloadUrl(value)).toBeNull();
    expect(parseLineItemDownload({
      title: 'Untrusted item', customAttributes: [{ key: '_download_url', value }],
    })).toBeNull();
  });

  it.each([
    'https://example.com/file?x=1&signature=abc%2Bdef',
    '{"url":"https://example.com/file?x=1&signature=abc%2Bdef","text":"Download"}',
    '["https://example.com/old","https://example.com/file?x=1&signature=abc%2Bdef"]',
  ])('preserves signed URL bytes across supported encodings', (value) => {
    expect(parseDownloadUrl(value)).toBe('https://example.com/file?x=1&signature=abc%2Bdef');
  });

  it('ignores malformed attribute entries', () => {
    expect(parseLineItemDownload({ title: 'Bad item', customAttributes: [null] })).toBeNull();
  });
});
