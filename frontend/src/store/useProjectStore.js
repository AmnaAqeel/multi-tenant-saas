import { create } from "zustand";
import { toast } from "sonner";

import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

export const useProjectStore = create((set, get) => ({
  // Tracking states
  isCreatingProject: false,
  isFetchingProject: false,
  isGettingProjectById: false,
  isFetchingProjectUsers: false,
  isFetchingArchive: false,

  // State
  allProjects: [],

  // Setters
  setProjects: (projects) => set({ allProjects: projects }),
  addProject: (newProject) =>
    set((state) => ({
      allProjects: [...state.allProjects, newProject],
    })),
  deleteProject: (id) =>
    set((state) => ({
      allProjects: state.allProjects.filter((p) => p._id !== id),
    })),

  // Actions
  createProjectApi: async (data) => {
    set({ isCreatingProject: true });
    try {
      const response = await axiosInstance.post("/projects/", data);

      if (response) {
        toast.success(
          response?.data?.message || "Project created successfully!",
        );
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isCreatingProject: false });
    }
  },
  fetchProjectsApi: async () => {
    set({ isFetchingProject: true });
    try {
      const response = await axiosInstance.get("/projects/", {});
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isFetchingProject: false });
    }
  },
  getProjectByIdApi: async (id) => {
    set({ isGettingProjectById: true });
    try {
      const response = await axiosInstance.get(`/projects/${id}`, {});
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isGettingProjectById: false });
    }
  },
  deleteProjectApi: async (id) => {
    try {
      const response = await axiosInstance.delete(`/projects/${id}`, {});
      console.log(`delete response in store:`, response);
      if (response) {
        toast.success(
          response?.data?.message || "Project deleted successfully!",
        );
      }
      return true;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  updateProjectApi: async (id, data) => {
    try {
      const response = await axiosInstance.patch(`/projects/${id}`, data);
      if (response) {
        toast.success(
          response?.data?.message || "Project updated successfully!",
        );
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  updateProjectStatusApi: async (id, field) => {
    try {
      const response = await axiosInstance.delete(`/projects/${id}/status`, {
        field,
      });
      if (response) {
        toast.success(
          response?.data?.message || "Project deleted successfully!",
        );
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  addTeamMembersApi: async (id, members) => {
    try {
      console.log("sending this to backend addMembers:", members);
      const response = await axiosInstance.patch(
        `/projects/${id}/add-members`,
        members,
      );
      if (response) {
        toast.success(response?.data?.message || "Member Added successfully!");
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  removeTeamMembersApi: async (id, members) => {
    try {
      console.log("Ids to remove", members);
      const response = await axiosInstance.patch(
        `/projects/${id}/remove-members`,
         [members] ,
      );
      if (response) {
        toast.success(response?.data?.message || "Member Added successfully!");
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  updateStatusApi: async (id, status) => {
    console.log("Hitting update Project status")
    try {
      const response = await axiosInstance.patch(`/projects/${id}/status`, {
        status,
      });
      if (response) {
        console.log("response:", response)
        toast.success(response?.data?.message || "Status Updated!");
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  getUsersByProjectApi: async (id) => {
    set({isFetchingProjectUsers: true});
    try {    
      const response = await axiosInstance.get(`/projects/${id}/members`, {});
      console.log("response: ", response);
      if (response) {
        return response.data.members;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }finally{
    set({isFetchingProjectUsers: false});
    }
  },
  archiveProjectApi: async () => {
    set({isFetchingArchive: true});
    try {    
      const response = await axiosInstance.get(`/projects/archived/list`, {});
      console.log("response: ", response);
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }finally{
    set({isFetchingArchive: false});
    }
  },
  restoreProjectApi : async (id) => {
    try {    
      const response = await axiosInstance.patch(`/projects/${id}/restore`, {});
      console.log("response: ", response);
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
}));
