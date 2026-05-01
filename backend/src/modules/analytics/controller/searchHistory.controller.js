import * as searchHistoryService from '../service/searchHistory.service.js';
import { sendSuccess } from '../../../utils/apiResponse.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';

export const logSearch = asyncHandler(async (req, res) => {
  const data = {
    ...req.body,
    ip: req.ip,
    device: req.headers['user-agent']
  };
  const history = await searchHistoryService.logSearch(data);
  return sendSuccess(res, { message: 'Search logged', data: history });
});

export const getHistories = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const histories = await searchHistoryService.getSearchHistories(category);
  return sendSuccess(res, { data: histories });
});

export const deleteHistory = asyncHandler(async (req, res) => {
  await searchHistoryService.deleteSearchHistory(req.params.id);
  return sendSuccess(res, { message: 'History deleted' });
});
