import { create } from "zustand";
import { toast } from "sonner";
import log from "../utils/logger";

import axiosInstance from "../utils/axiosInstance";
import { handleApiError } from "../utils/errorHandler";

export const useTaskStore = create((set, get) => ({
  // Tracking states
  isCreatingTask: false,
  isFetchingTasks: false,
  isFetchingSubTasks: false,
  isGettingTaskById: false,

  // State
  allTasks: [],

  // Setters
  setTasks: (tasks) => set({ allTasks: tasks }),

  addTask: (task) =>
    set((state) => ({
      allTasks: [...state.allTasks, task],
    })),

    addProjectTask: (task) =>
    set((state) => ({
      projectTasks: [...state.projectTasks, task],
    })),

  // Actions
  createTaskApi: async (projectId, data) => {
    try {
      set({ isCreatingTask: true });
      const response = await axiosInstance.post(
        `/projects/${projectId}/tasks`,
        data,
      );
      log("response of created task:", response);
      if (response) {
        toast.success("Task created successfully!");
        return true;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isCreatingTask: false });
    }
  },
  getTaskByIdApi: async (projectId, taskId) => {
    set({ isGettingTaskById: true });
    log("projectId:", projectId);
    log("taskId:", taskId);
    try {
      const response = await axiosInstance.get(
        `/projects/${projectId}/tasks/${taskId}`,
        {},
      );
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isGettingTaskById: false });
    }
  },
  fetchAllTasksApi: async () => { 
    try {
      set({ isFetchingTasks: true });
      const response = await axiosInstance.get("/projects/tasks", {});
      if (response) {
        log("All tasks response:", response);
        set({ allTasks: response.data.data });
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isFetchingTasks: false });
    }
  },
  fetchProjectTasksApi: async (projectId) => {
    try {
      set({ isFetchingTasks: true });
      const response = await axiosInstance.get(`/projects/${projectId}/tasks`, {});
      if (response) {
        log("Project tasks response:", response);
        set({ projectTasks: response.data });
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    } finally {
      set({ isFetchingTasks: false });
    }
  },
  
  updateStatusApi: async (projectId, taskId, status) => {
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/tasks/${taskId}/status`,
        { status },
      );
      log("response", response);
      if (response) {
        toast.success("Task status changed successfully!");
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  updateTaskApi: async (projectId, taskId, updated) => {
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/tasks/${taskId}`,
        updated,
      );
      log("response", response);
      if (response) {
        toast.success("Task updated successfully!");
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  updateTaskMembersApi:async (projectId, taskId, data) => {
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/tasks/${taskId}/update-members`, data
      );
      log("response", response);
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  deleteTaskApi: async (projectId, taskId) => {
    try {
      const response = await axiosInstance.delete(
        `/projects/${projectId}/tasks/${taskId}`, 
      );
      if(response){
        log("response", response);
        toast.success("task deleted successfully!");
        return response;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },

  fetchSubTasksApi: async (projectId, taskId) => {
    log("projectid & taskId", projectId, taskId);
    set({ isFetchingSubTasks: true });
    try {
      const response = await axiosInstance.get(
        `/projects/${projectId}/tasks/${taskId}/subtasks`,
        {},
      );
      if (response) {
        return response.data;
      }
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }finally{
      set({ isFetchingSubTasks: false });
    }
  },
  createSubTaskApi: async (projectId, taskId, title) => {
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/tasks/${taskId}/subtasks`,
         title ,
      );
      log("response of subTask creation", response);
      if (response) {
        toast.success("Subtask created successfully!");
      }
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  checkSubTaskApi: async (projectId, taskId, subTaskId, status) => {
    log("status:", status);
    try {
      const response = await axiosInstance.patch(
        `/projects/${projectId}/tasks/${taskId}/subtasks/${subTaskId}`, status,
      );
      log("response", response);
      if (response) {
        toast.success("Subtask updated successfully!");
      }
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  deleteSubTaskApi: async (projectId, taskId, subTaskId) => {
    try {
      const response = await axiosInstance.delete(
        `/projects/${projectId}/tasks/${taskId}/subtasks/${subTaskId}`,
      );
      log("response", response);
      if (response) {
        toast.success("Subtask deleted successfully!");
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },

  addCommentApi: async (projectId, taskId, text) => {
    try {
      const response = await axiosInstance.post(
        `/projects/${projectId}/tasks/${taskId}/comments`,
        {text}
      );
      log("response", response);
      if (response) {
        toast.success("Comment added successfully!");
      }
      return response.data;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
  deleteCommentApi: async (projectId, taskId, commentId) => {
    try {
      const response = await axiosInstance.delete(
        `/projects/${projectId}/tasks/${taskId}/comments/${commentId}`,
        {}
      );
      log("response", response);
      if (response) {
        toast.success("Comment deleted successfully!");
      }
      return response;
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      handleApiError(error);
    }
  },
}));
