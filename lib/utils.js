const DEFAULT_SUMMARY_LIMIT = parseInt(process.env.DOMOTZ_SUMMARY_LIMIT || '500', 10);

export function summarize(data, limit = DEFAULT_SUMMARY_LIMIT) {
  if (Array.isArray(data) && data.length > limit) {
    return {
      total: data.length,
      showing: limit,
      items: data.slice(0, limit),
      truncated: true,
      hint: `Showing first ${limit} of ${data.length} items. Use page_size/page_number to paginate, or filter parameters to narrow results.`
    };
  }
  return data;
}

/**
 * Auto-paginate a GET endpoint that supports page_size/page_number.
 * Fetches all pages and returns the combined result array.
 */
export async function fetchAllPages(domotzApi, url, params, pageSize = 500) {
  const allItems = [];
  let page = 0;

  while (true) {
    const pageParams = { ...params, page_size: pageSize, page_number: page };
    const response = await domotzApi.get(url, { params: pageParams });
    const data = response.data;

    if (!Array.isArray(data) || data.length === 0) {
      break;
    }

    allItems.push(...data);

    // If we got fewer items than page_size, we've reached the last page
    if (data.length < pageSize) {
      break;
    }

    page++;
  }

  return allItems;
}
