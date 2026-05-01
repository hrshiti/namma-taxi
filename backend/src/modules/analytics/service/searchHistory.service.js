import SearchHistory from '../model/searchHistory.model.js';

export const logSearch = async (searchData) => {
  return SearchHistory.create(searchData);
};

export const getSearchHistories = async (category, limit = 100) => {
  const query = category ? { category } : {};
  return SearchHistory.find(query)
    .populate('userId', 'name phone')
    .sort({ createdAt: -1 })
    .limit(limit);
};

export const deleteSearchHistory = async (id) => {
  return SearchHistory.findByIdAndDelete(id);
};
