const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  getAuthHeader() {
    const token = localStorage.getItem('swasthya_auth_token') || 'dev-test-token-patient';
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async get(endpoint) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: this.getAuthHeader(),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[API GET ${endpoint}] fallback or error:`, e.message);
      throw e;
    }
  }

  async post(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeader(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[API POST ${endpoint}] fallback or error:`, e.message);
      throw e;
    }
  }

  async patch(endpoint, body) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeader(),
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `HTTP Error ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      console.warn(`[API PATCH ${endpoint}] fallback or error:`, e.message);
      throw e;
    }
  }

  // AI Assistant Chat
  async sendAiChat(message, language = 'en', patientContext = '') {
    return this.post('/ai/chat', {
      message,
      language,
      patient_context: patientContext,
    });
  }

  // Appointments
  async getAppointments(status = '') {
    const q = status ? `?status=${status}` : '';
    return this.get(`/appointments${q}`);
  }

  async bookAppointment(data) {
    return this.post('/appointments', data);
  }

  async updateAppointment(id, updateData) {
    return this.patch(`/appointments/${id}`, updateData);
  }

  // Prescriptions
  async getPrescriptions() {
    return this.get('/prescriptions');
  }

  async createPrescription(data) {
    return this.post('/prescriptions', data);
  }

  // Medical Records
  async getMedicalRecords(patientId = '', type = '') {
    let q = [];
    if (patientId) q.push(`patient_id=${patientId}`);
    if (type) q.push(`record_type=${type}`);
    const queryStr = q.length ? `?${q.join('&')}` : '';
    return this.get(`/records${queryStr}`);
  }

  async addMedicalRecord(data) {
    return this.post('/records', data);
  }

  // Reminders
  async getReminders() {
    return this.get('/reminders');
  }

  async addReminder(data) {
    return this.post('/reminders', data);
  }

  async logReminderStatus(reminderId, status, notes = '') {
    return this.post('/reminders/log', { reminder_id: reminderId, status, notes });
  }

  // Staff & Doctors
  async getDoctors(deptId = '') {
    const q = deptId ? `?department_id=${deptId}` : '';
    return this.get(`/staff/doctors${q}`);
  }

  async getDepartments() {
    return this.get('/staff/departments');
  }

  // Admin
  async getAdminStats() {
    return this.get('/admin/stats');
  }

  async getPendingStaff() {
    return this.get('/admin/pending-staff');
  }

  async processStaffAction(staffId, action, remarks = '') {
    return this.post('/admin/staff-action', { staff_id: staffId, action, remarks });
  }

  async getAuditLogs() {
    return this.get('/admin/audit-logs');
  }
}

export const api = new ApiService();
