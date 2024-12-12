import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class EvaluationService {
  async createForm(formData) {
    const response = await axios.post(`${API_URL}/evaluation`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }

  async getAllForms() {
    const response = await axios.get(`${API_URL}/evaluation`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }

  async getFormById(id) {
    const response = await axios.get(`${API_URL}/evaluation/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }

  async updateForm(id, formData) {
    const response = await axios.put(`${API_URL}/evaluation/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }

  async deleteForm(id) {
    const response = await axios.delete(`${API_URL}/evaluation/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  }

  async updateFormStatus(id, status) {
    const response = await axios.patch(
      `${API_URL}/evaluation/${id}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }
    );
    return response.data;
  }
}

const evaluationService = new EvaluationService();
export default evaluationService;
