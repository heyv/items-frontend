import axios from "axios";

const API_URL = "http://localhost:4000/items";

export const getAllItems = async (name = "") => {
  try {
    const response = await axios.get(API_URL, { params: { name } });
    return response.data;
  } catch (error) {
    console.error("Error fetching items:", error);
    throw error;
  }
};

export const createItem = async (itemData) => {
  const response = await axios.post(API_URL, itemData);
  return response.data;
};

export const updateItem = async (id, updatedData) => {
  const response = await axios.put(`${API_URL}/${id}`, updatedData);
  return response.data;
};

export const deleteItem = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
