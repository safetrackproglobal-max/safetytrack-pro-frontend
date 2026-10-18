// src/services/chemicalApiService.js

// ✅ Import the centralized API instance instead of Axios directly
// Adjust the path if your api.js is in a different folder
import api from './api'; 

class ChemicalApiService {
  
  // Helper method to standardize the response format
  async makeApiCall(endpoint, options = {}) {
    try {
      // Use the unified 'api' instance
      const response = await api({
        url: endpoint,
        ...options
      });
      
      return {
        success: true,
        // Handle cases where data is nested in response.data or just response.data
        data: response.data?.data || response.data,
        status: response.status
      };
    } catch (error) {
      console.error(`Chemical API Error for ${endpoint}:`, error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Failed to connect to chemical service',
        status: error.response?.status
      };
    }
  }

  // ==========================================
  // REAL CHEMICAL ENDPOINTS
  // ==========================================

  async getRealTimeMetrics() {
    return await this.makeApiCall('/chemical/dashboard/metrics');
  }

  async getSystemHealth() {
    return await this.makeApiCall('/chemical/system/health');
  }

  async getComplianceStatus() {
    return await this.makeApiCall('/chemical/compliance/status');
  }

  async getSafetyPerformance() {
    return await this.makeApiCall('/chemical/performance/metrics');
  }

  async getChemicalInventory() {
    return await this.makeApiCall('/chemical/inventory');
  }

  const loadDocuments = async () => {
  try {
    const response = await chemicalSafetyService.getChemicalDocuments();
    if (response.success) {
      setDocuments(response.data); // This will now receive the real documents
    }
  } catch (error) {
    console.error('Error loading documents:', error);
  }
};

  // ==========================================
  // POST/PUT ENDPOINTS
  // ==========================================

  async addChemical(data) {
    return await this.makeApiCall('/chemical/inventory', {
      method: 'POST',
      data
    });
  }

  async updateChemical(id, data) {
    return await this.makeApiCall(`/chemical/inventory/${id}`, {
      method: 'PUT',
      data
    });
  }

  async submitRiskAssessment(data) {
    return await this.makeApiCall('/chemical/risk-assessment', {
      method: 'POST',
      data
    });
  }

  async runProcessHazardAnalysis() {
    return await this.makeApiCall('/chemical/hazard-analysis', {
      method: 'POST'
    });
  }

  async submitSafetyAudit(data) {
    return await this.makeApiCall('/chemical/safety-audit', {
      method: 'POST',
      data
    });
  }
}

const chemicalSafetyService = new ChemicalApiService();
export default chemicalSafetyService;
