import AirportData from '../model/airport.model.js';

export const getAllData = async (type) => {
  const query = type ? { type } : {};
  return AirportData.find(query).sort({ createdAt: -1 });
};

export const createData = async (data) => {
  return AirportData.create(data);
};

export const updateData = async (id, data) => {
  return AirportData.findByIdAndUpdate(id, data, { new: true });
};

export const deleteData = async (id) => {
  return AirportData.findByIdAndDelete(id);
};
