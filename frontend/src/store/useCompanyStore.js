import { create } from "zustand";
import { toast } from "sonner";

import axiosInstance from "../utils/axiosInstance";
import { rawAxios } from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

import { refreshAuthUser } from "../utils/refreshAuthUser";

export const useCompanyStore = create((set, get) => ({
  inviteCompany: null,
  isRegisteringCompany: false,
  isFetchingCompany: false,
  showSearch: false,
  isSwitching: false,
  companyUsers: [],
  companyInfo: null,

  setShowSearch: (value) => set({ showSearch: value }),
  registerCompany: async (data) => {
    set({ isRegesteringCompany: true });
    try {
      const response = await axiosInstance.post("/companies/", data);

      if (response) {
        try {
          refreshAuthUser();
        } catch (error) {
          toast.error(error?.response?.data || "An error occured!");
        }
        toast.success(response?.data?.message || "Switched successfully!");
      }
      return true;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isRegisteringCompany: false });
    }
  },
  searchCompany: async (token) => {
    set({ isFetchingCompany: true });
    try {
      const response = await rawAxios.get(`/invites/${token}`, {
        withCredentials: false, // Important! Avoids sending refreshToken cookie
      });
      if (response) {
        console.log("response:", response);
        set({ inviteCompany: response.data.invite.company });
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    } finally {
      set({ isFetchingCompany: false });
    }
  },
  switchCompany: async (id) => {
    set({ isSwitching: true, switchingTo: id });

    try {
      const response = await axiosInstance.patch(`/companies/switch/${id}`, {});

      if (response) {
        try {
          const response = await refreshAuthUser();
          console.log("response of refreshAuthUser:", response);
        } catch (error) {
          toast.error(error?.response?.data || "An error occured!");
        }
        toast.success(response?.data?.message || "Switched successfully!");
      }
      return true;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isSwitching: false });
    }
  },
  fetchCompanyUsers: async (id) => {
    set({ isFetchingCompany: true });
    try {
      const response = await axiosInstance.get(`/companies/${id}/members`); // Get all users in company
      console.log("users:", response);
      set({ companyUsers: response.data.members });
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    }finally {
      set({ isFetchingCompany: false });
    }
  },
  fetchCompanyInfo: async (id) => {
    set({ isFetchingCompany: true });
    try {
      const response = await axiosInstance.get(`/companies/${id}`); // Get all users in company
      console.log("response:", response);
      if(response){
        set({ companyInfo: response.data });
      }
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
      return null;
    }finally {
      set({ isFetchingCompany: false });
    }
  },  
  updateCompanyRoles: async (companyId, updates) => {
    try {
      const response = await axiosInstance.patch(`/companies/${companyId}/members/update-roles`, {
        updates, // [{ userId, newRole }]
      });
      console.log("response:", response);
      toast.success("Roles updated successfully!");
      return response.data;
    } catch (error) {
      console.error("Role Update Error:", error);
      handleApiError(error);
      return null;
    }
  },
  deleteCompanyMember: async (companyId, userId) => {
    try {
      const response = await axiosInstance.delete(`/companies/${companyId}/members/${userId}`);
      console.log("response:", response);
      toast.success("Member deleted successfully!");
      return true;
    } catch (error) { 
      console.error("Member Delete Error:", error);
      handleApiError(error);
      return false;
  } 
},  
  updateCompany : async (id, updates) => {
    try {
      const response = await axiosInstance.patch(`/companies/${id}`, updates);
      console.log("response:", response);
      return true;
    } catch (error) {
      console.error("Company Update Error:", error);
      handleApiError(error);
      return null;
    } 
  },
  deleteCompany : async (id) => {
    try {
      const response = await axiosInstance.delete(`/companies/${id}`);
      console.log("response:", response);
      return true;
    } catch (error) {
      console.error("Company Delete Error:", error);
      handleApiError(error);
      return null;
    } 
  },  
  leaveCompany : async (id) => {
    try {
      const response = await axiosInstance.post(`/companies/${id}/leave`);
      console.log("response:", response);
      return true;
    } catch (error) {
      console.error("Company Leave Error:", error);
      handleApiError(error);
      return null;

    } 
  },
}));
