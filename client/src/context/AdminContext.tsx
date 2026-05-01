import { create } from "zustand";
import axios from "axios";

interface User {
  _id: string
  name: string
  email: string
  username: string
  collegeName: string
  branch: string
  avatar: string
  college: string
  isAffiliate: boolean
  createdAt: string
}

interface Challenge {
  _id: string
  title: string
  createdAt: string
  category: string[]
  difficulty: string
  platform: string
  description: string
  problemLink: string
  solvedUsers: any[]
}

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalUsers: number
  total: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

interface FilterOptions {
  colleges: string[]
  branches: string[]
}

interface ChallengePaginationInfo {
  currentPage: number
  totalPages: number
  totalChallenges: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

interface FetchUsersParams {
  page?: number
  limit?: number
  search?: string
  collegeName?: string[]
  branch?: string[]
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

interface FetchChallengesParams {
  page?: number
  limit?: number
  search?: string
  difficulty?: string
  category?: string
  sortBy?: string
  sortDirection?: "asc" | "desc"
}

interface AdminState {
  users: User[]
  isAdminAuthenticated: boolean
  challenges: Challenge[]
  loading: boolean
  error: string | null
  token: string | null
  pagination: PaginationInfo | null
  challengePagination: ChallengePaginationInfo | null
  filterOptions: FilterOptions | null
  fetchUsers: (params?: FetchUsersParams) => Promise<void>
  fetchChallenges: (params?: FetchChallengesParams) => Promise<void>
  fetchStats: () => Promise<any>
  fetchPOTD: () => Promise<any>
  deleteChallenge: (id: string) => Promise<boolean>
  login: (token: string) => void
  logout: () => void
}

export const useAdminStore = create<AdminState>((set, get) => {
  const token = localStorage.getItem("Admintoken");
  const isAdminAuthenticated = !!token;

  return {
    users: [],
    challenges: [],
    loading: false,
    error: null,
    token,
    isAdminAuthenticated,
    challengePagination: null,
    pagination: null,
    filterOptions: null,

    // Fetch users from the API with pagination and filtering
    fetchUsers: async (params: FetchUsersParams = {}) => {
      try {
        set({ loading: true, error: null });

        const {
          page = 1,
          limit = 20,
          search = "",
          collegeName = [],
          branch = [],
          sortBy = "createdAt",
          sortDirection = "desc"
        } = params;

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortDirection
        });

        if (search) queryParams.append('search', search);
        if (collegeName.length > 0) queryParams.append('collegeName', collegeName.join(','));
        if (branch.length > 0) queryParams.append('branch', branch.join(','));

        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/users?${queryParams}`,
          {
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
            withCredentials: true,
          }
        );

        if (response.data) {
          const { users, pagination, filters } = response.data;
          
          set({ 
            users: users || [],
            pagination,
            filterOptions: filters
          });
        } else {
          throw new Error("Invalid data format received from API");
        }

      } catch (err) {
        console.error("Error fetching users:", err);
        set({ 
          error: err instanceof Error ? err.message : "Failed to fetch users",
          users: [],
          pagination: null,
          filterOptions: null
        });
      } finally {
        set({ loading: false });
      }
    },

    fetchStats: async () => {
      try {
        set({ loading: true, error: null });

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/stats`, {
          headers: {
            Authorization: `Bearer ${get().token}`,
          },
          withCredentials: true,
        });

        return response.data;
      } catch (err) {
        console.error("Error fetching stats:", err);
        set({ error: (err as Error).message });
        return null;
      } finally {
        set({ loading: false });
      }
    },

    fetchPOTD: async () => {
      try {
        set({ loading: true, error: null });

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/getPotd`, {
          headers: {
            Authorization: `Bearer ${get().token}`,
          },
          withCredentials: true,
        });

        return response.data;
      } catch (err) {
        console.error("Error fetching POTD:", err);
        set({ error: (err as Error).message });
        return null;
      } finally {
        set({ loading: false });
      }
    },

    fetchChallenges: async (params: FetchChallengesParams = {}) => {
      try {
        set({ loading: true, error: null })

        const {
          page = 1,
          limit = 10,
          search = "",
          difficulty = "",
          category = "",
          sortBy = "createdAt",
          sortDirection = "desc",
        } = params

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
          sortBy,
          sortDirection,
        })

        if (search) queryParams.append("search", search)
        if (difficulty) queryParams.append("difficulty", difficulty)
        if (category) queryParams.append("category", category)

        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/admin/challenges?${queryParams}`, {
          headers: {
            Authorization: `Bearer ${get().token}`,
          },
          withCredentials: true,
        })

        if (response.data) {
          const { challenges, pagination } = response.data

          set({
            challenges: challenges || [],
            challengePagination: pagination,
          })
        } else {
          throw new Error("Invalid data format received from API")
        }
      } catch (err) {
        console.error("Error fetching challenges:", err)
        set({
          error: err instanceof Error ? err.message : "Failed to fetch challenges",
          challenges: [],
          challengePagination: null,
        })
      } finally {
        set({ loading: false })
      }
    },

    deleteChallenge: async (id: string) => {
      try {
        set({ loading: true, error: null })

        const response = await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/admin/challenges/${id}`, {
          headers: {
            Authorization: `Bearer ${get().token}`,
          },
          withCredentials: true,
        })

        if (response.data.success) {
          // Refresh challenges after deletion
          await get().fetchChallenges({ page: 1, limit: 10 })
          return true
        }
        return false
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to delete challenge"
        console.error("Error deleting challenge:", err)
        set({ error: errorMsg })
        return false
      } finally {
        set({ loading: false })
      }
    },

    // Login function to set token and store it in local storage
    login: (token: string) => {
      localStorage.setItem("Admintoken", token);
      set({ token, isAdminAuthenticated: true });
    },

    logout: async () => {
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/admin/logout`, {}, {
          withCredentials: true,
        });
      } catch (error) {
        console.error('Admin logout API call failed:', error);
      }
      
      localStorage.removeItem("Admintoken");
      set({ token: null, isAdminAuthenticated: false, users: [], pagination: null, filterOptions: null });
    },
  };
});