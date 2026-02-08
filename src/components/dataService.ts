// src/services/dataService.ts

export const vendorService = {
  getAll() {
    return [];
  },
};

export const locationService = {
  async getCurrentPosition() {
    return {
      latitude: 28.6139,
      longitude: 77.2090,
    };
  },
};
