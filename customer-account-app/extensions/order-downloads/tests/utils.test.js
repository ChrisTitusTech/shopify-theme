import { describe, it, expect } from 'vitest';
import { parseLineItemDownload, extractDownloads } from '../src/utils.js';

// ---------------------------------------------------------------------------
// parseLineItemDownload
// ---------------------------------------------------------------------------

describe('parseLineItemDownload', () => {
  it('returns the URL from the download_url customAttribute', () => {
    const item = {
      title: 'CTT Linux Course',
      customAttributes: [{ key: 'download_url', value: 'https://cdn.cttstore.com/linux.zip' }],
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

  it('returns null when customAttributes has no download_url key', () => {
    const item = {
      title: 'Gift Card',
      customAttributes: [{ key: 'gift_note', value: 'Happy Birthday' }],
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when download_url value is an empty string', () => {
    const item = {
      title: 'Blank URL',
      customAttributes: [{ key: 'download_url', value: '' }],
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when download_url value is only whitespace', () => {
    const item = {
      title: 'Whitespace URL',
      customAttributes: [{ key: 'download_url', value: '   ' }],
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

  it('ignores other attributes and returns only the download_url value', () => {
    const item = {
      title: 'Windows Toolbox',
      customAttributes: [
        { key: 'color', value: 'blue' },
        { key: 'download_url', value: 'https://cdn.cttstore.com/toolbox.exe' },
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
      customAttributes: [{ key: 'download_url', value: 'https://cdn.cttstore.com/pro-bundle.zip' }],
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
        customAttributes: [{ key: 'download_url', value: 'https://cdn.cttstore.com/linux-pro.zip' }],
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
        customAttributes: [{ key: 'download_url', value: 'https://cdn.cttstore.com/a.zip' }],
      },
      {
        title: 'Course B',
        customAttributes: [{ key: 'download_url', value: 'https://cdn.cttstore.com/b.zip' }],
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
