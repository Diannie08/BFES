import axios from 'axios';

// Use the API URL from environment variables, or default to localhost
const API_URL = 'http://localhost:5000/api';

// Axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response error:', error.response || error);
    return Promise.reject(error);
  }
);

class EvaluationService {
  // Form Management
  async createForm(formData) {
    try {
      const response = await axiosInstance.post('/evaluation', formData);
      return response.data;
    } catch (error) {
      console.error('Error creating form:', error.response?.data || error.message);
      throw error;
    }
  }

  async getAllForms(isAdmin = false) {
    try {
      console.log('Fetching all forms...');
      const url = isAdmin ? '/evaluation/admin/forms' : '/evaluation';
      const response = await axiosInstance.get(url);
      console.log('Forms fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching forms:', error.response?.data || error.message);
      throw error;
    }
  }

  async getFormById(id) {
    try {
      const response = await axiosInstance.get(`/evaluation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching form:', error.response?.data || error.message);
      throw error;
    }
  }

  async updateForm(id, formData) {
    try {
      const response = await axiosInstance.put(`/evaluation/${id}`, formData);
      return response.data;
    } catch (error) {
      console.error('Error updating form:', error.response?.data || error.message);
      throw error;
    }
  }

  async deleteForm(id) {
    try {
      const response = await axiosInstance.delete(`/evaluation/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting form:', error.response?.data || error.message);
      throw error;
    }
  }

  // Evaluation Results
  async getEvaluationResults() {
    try {
      const response = await axiosInstance.get('/evaluation/results');
      return response.data;
    } catch (error) {
      console.error('Error fetching evaluation results:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEvaluationResultById(id) {
    try {
      const response = await axiosInstance.get(`/evaluation/results/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching evaluation result:', error.response?.data || error.message);
      throw error;
    }
  }

  async getEvaluationResultsByDate(date) {
    try {
      const response = await axiosInstance.get(`/evaluation/results/date/${date}`);
      // Filter out any results without evaluationForm
      return response.data.filter(result => result && result.evaluationForm);
    } catch (error) {
      console.error('Error fetching evaluation results by date:', error.response?.data || error.message);
      throw error;
    }
  }

  async submitEvaluation(evaluationId, responses) {
    try {
      const response = await axiosInstance.post(`/evaluation/${evaluationId}/submit`, responses);
      return response.data;
    } catch (error) {
      console.error('Error submitting evaluation:', error.response?.data || error.message);
      throw error;
    }
  }
}

const evaluationService = new EvaluationService();
export default evaluationService;
