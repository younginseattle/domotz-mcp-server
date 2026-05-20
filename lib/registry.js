/**
 * Generic action dispatcher for category-based tools.
 * Replaces the 1000-line switch statement with data-driven routing.
 */

import { summarize, fetchAllPages } from './utils.js';

const STATUS_HINTS = {
  400: "Check required parameters and body format. Review the action's GOTCHAS in the tool description.",
  401: "Verify DOMOTZ_API_KEY environment variable is set correctly and the key is still valid.",
  403: "Your API key may lack permission for this operation. Check key permissions in the Domotz portal.",
  404: "The specified resource does not exist. Verify agent_id and device_id are correct.",
  409: "Conflict — the resource may already exist or be in an incompatible state.",
  422: "Unprocessable request — the body format is likely incorrect for this action.",
  429: "Rate limit reached. Wait 10–30 seconds before retrying.",
  500: "Domotz API internal error. Try again in a moment.",
  503: "Domotz API is temporarily unavailable.",
};
const DEFAULT_HINT = "Unexpected error. See Domotz API docs at https://docs.domotz.com/api";

export async function dispatch(actionMap, actionName, args, domotzApi) {
  const action = actionMap[actionName];
  if (!action) {
    throw new Error(`Unknown action: ${actionName}`);
  }

  try {
    // Build URL by replacing {param} placeholders with args values
    let url = action.url.replace(/\{(\w+)\}/g, (_, key) => {
      if (args[key] === undefined) throw new Error(`Missing required parameter: ${key}`);
      return encodeURIComponent(args[key]);
    });

    // Extract query params from args
    const params = {};
    if (action.queryParams) {
      for (const qp of action.queryParams) {
        if (args[qp] !== undefined) params[qp] = args[qp];
      }
    }

    const method = action.method.toLowerCase();

    let response;
    if (method === 'head') {
      response = await domotzApi.head(url, { params });
      const headResult = { count: parseInt(response.headers['x-entities-count'] || '0', 10) };
      return {
        content: [{ type: 'text', text: JSON.stringify(headResult) }],
        structuredContent: headResult
      };
    } else if (method === 'get') {
      // Auto-paginate if the endpoint supports pagination and caller didn't specify page params
      const supportsPagination = action.queryParams &&
        action.queryParams.includes('page_size') &&
        action.queryParams.includes('page_number');
      const callerPaginated = args.page_size !== undefined || args.page_number !== undefined;

      if (supportsPagination && !callerPaginated) {
        const allData = await fetchAllPages(domotzApi, url, params);
        const paginatedResult = summarize(allData);
        return {
          content: [{ type: 'text', text: JSON.stringify(paginatedResult) }],
          structuredContent: paginatedResult
        };
      }

      response = await domotzApi.get(url, { params });
    } else if (method === 'post') {
      response = await domotzApi.post(url, action.hasBody ? (args.body || {}) : undefined, { params });
    } else if (method === 'put') {
      response = await domotzApi.put(url, action.hasBody ? (args.body || {}) : undefined, { params });
    } else if (method === 'delete') {
      response = await domotzApi.delete(url, { params });
      const deleteResult = { success: true, status: response.status };
      return {
        content: [{ type: 'text', text: JSON.stringify(deleteResult) }],
        structuredContent: deleteResult
      };
    }

    const rawResult = response.data || { success: true, status: response.status };
    const result = summarize(rawResult);
    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
      structuredContent: result
    };
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            error: true,
            status,
            message: error.response.data?.message || error.message,
            hint: STATUS_HINTS[status] || DEFAULT_HINT,
            data: error.response.data
          })
        }],
        isError: true
      };
    }
    throw error;
  }
}
