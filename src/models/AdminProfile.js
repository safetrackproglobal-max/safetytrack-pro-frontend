// Optional: If you need to store additional admin-specific data
class AdminProfile {
  constructor(data = {}) {
    this.id = data.id;
    this.userId = data.user_id;
    this.employeeCount = data.employee_count || 0;
    this.department = data.department || '';
    this.permissions = data.permissions || [];
    this.settings = data.settings || {};
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  static fromApiResponse(data) {
    return new AdminProfile(data);
  }
}

export default AdminProfile;