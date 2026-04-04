import { describe, it, expect } from 'vitest';
import { parseLineItemDownload, extractDownloads } from '../src/utils.js';

// ---------------------------------------------------------------------------
// parseLineItemDownload
// ---------------------------------------------------------------------------

describe('parseLineItemDownload', () => {
  it('returns the last URL from a list.url JSON array', () => {
    const item = {
      title: 'CTT Linux Course',
      product: {
        metafield: { value: '["https://example.com/v1.zip","https://example.com/v2.zip"]' },
      },
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'CTT Linux Course',
      url: 'https://example.com/v2.zip',
    });
  });

  it('returns the only URL from a single-entry array', () => {
    const item = {
      title: 'Windows Toolbox',
      product: {
        metafield: { value: '["https://cdn.cttstore.com/toolbox.exe"]' },
      },
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'Windows Toolbox',
      url: 'https://cdn.cttstore.com/toolbox.exe',
    });
  });

  it('handles a bare string value (non-array) gracefully', () => {
    const item = {
      title: 'Simple Product',
      product: {
        metafield: { value: '"https://example.com/file.zip"' },
      },
    };
    expect(parseLineItemDownload(item)).toEqual({
      title: 'Simple Product',
      url: 'https://example.com/file.zip',
    });
  });

  it('returns null when metafield is null', () => {
    const item = { title: 'Physical Item', product: { metafield: null } };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when product is null', () => {
    const item = { title: 'No Product', product: null };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when the line item itself is null', () => {
    expect(parseLineItemDownload(null)).toBeNull();
  });

  it('returns null when JSON parse fails (malformed value)', () => {
    const item = {
      title: 'Bad Data',
      product: { metafield: { value: 'not-json' } },
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null for an empty array', () => {
    const item = {
      title: 'Empty URLs',
      product: { metafield: { value: '[]' } },
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when the last array entry is an empty string', () => {
    const item = {
      title: 'Blank URL',
      product: { metafield: { value: '["https://example.com/old.zip",""]' } },
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });

  it('returns null when metafield value is an empty string', () => {
    const item = {
      title: 'Empty Value',
      product: { metafield: { value: '' } },
    };
    expect(parseLineItemDownload(item)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// extractDownloads
// ---------------------------------------------------------------------------

describe('extractDownloads', () => {
  it('filters out items with no download, keeps items with one', () => {
    const lineItems = [
      {
        title: 'Physical T-Shirt',
        product: { metafield: null },
      },
      {
        title: 'Linux Pro Course',
        product: {
          metafield: { value: '["https://cdn.cttstore.com/linux-pro.zip"]' },
        },
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
        product: { metafield: { value: '["https://cdn.cttstore.com/a.zip"]' } },
      },
      {
        title: 'Course B',
        product: { metafield: { value: '["https://cdn.cttstore.com/b-v1.zip","https://cdn.cttstore.com/b-v2.zip"]' } },
      },
    ];
    expect(extractDownloads(lineItems)).toEqual([
      { title: 'Course A', url: 'https://cdn.cttstore.com/a.zip' },
      { title: 'Course B', url: 'https://cdn.cttstore.com/b-v2.zip' },
    ]);
  });

  it('returns an empty array when no items have downloads', () => {
    const lineItems = [
      { title: 'Sticker Pack', product: { metafield: null } },
      { title: 'Mug', product: null },
    ];
    expect(extractDownloads(lineItems)).toEqual([]);
  });

  it('returns an empty array for an empty line items list', () => {
    expect(extractDownloads([])).toEqual([]);
  });
});
