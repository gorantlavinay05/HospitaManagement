const UserRepository = require('../repositories/UserRepository');
const AppointmentRepository = require('../repositories/AppointmentRepository');
const DepartmentRepository = require('../repositories/DepartmentRepository');
const DoctorRepository = require('../repositories/DoctorRepository');
const ActivityLogRepository = require('../repositories/ActivityLogRepository');

const getLogCategory = (action) => {
  const act = action.toLowerCase();
  if (act.includes('login') || act.includes('logged in') || act.includes('logout') || act.includes('logged out')) {
    return 'Authentication';
  }
  if (act.includes('appointment') || act.includes('booking') || act.includes('consultation')) {
    return 'Appointments';
  }
  if (act.includes('doctor') || act.includes('patient') || act.includes('user') || act.includes('status')) {
    return 'User Management';
  }
  if (act.includes('department')) {
    return 'Departments';
  }
  return 'System';
};

class AdminService {
  async getDashboardStats() {
    const totalPatients = await UserRepository.findAll({ role: 'Patient' });
    const totalDoctors = await UserRepository.findAll({ role: 'Doctor' });
    const totalAppointmentsCount = await AppointmentRepository.count({});
    const pendingAppointmentsCount = await AppointmentRepository.count({ status: 'Pending' });
    const completedAppointmentsCount = await AppointmentRepository.count({ status: 'Completed' });
    
    const allActivities = await ActivityLogRepository.findAll();
    const enrichedActivities = allActivities.map(log => {
      const obj = log.toObject ? log.toObject() : log;
      return {
        ...obj,
        category: getLogCategory(obj.action)
      };
    });
    const recentActivities = enrichedActivities.filter(log => log.category !== 'Authentication');
    const departments = await DepartmentRepository.findAll();
    const doctorsList = await DoctorRepository.findAll();

    // Group doctors by department
    const departmentStats = departments.map(dept => {
      const doctorsInDept = doctorsList.filter(doc => doc.departmentId && doc.departmentId._id.toString() === dept._id.toString());
      return {
        name: dept.name,
        doctorsCount: doctorsInDept.length
      };
    });

    // Monthly stats for the current year
    const currentYear = new Date().getFullYear();
    const appointments = await AppointmentRepository.findAll({
      appointmentDate: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`)
      }
    });

    const monthlyStats = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(0, i).toLocaleString('default', { month: 'short' }),
      appointments: 0
    }));

    appointments.forEach(app => {
      const monthIndex = new Date(app.appointmentDate).getMonth();
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyStats[monthIndex].appointments += 1;
      }
    });

    return {
      counts: {
        patients: totalPatients.length,
        doctors: totalDoctors.length,
        appointments: totalAppointmentsCount,
        pending: pendingAppointmentsCount,
        completed: completedAppointmentsCount
      },
      departmentStats,
      monthlyStats,
      recentActivities: recentActivities.slice(0, 10)
    };
  }

  async getActivityLogs() {
    const logs = await ActivityLogRepository.findAll();
    const enrichedLogs = logs.map(log => {
      const obj = log.toObject ? log.toObject() : log;
      return {
        ...obj,
        category: getLogCategory(obj.action)
      };
    });
    return enrichedLogs.filter(log => log.category !== 'Authentication');
  }
}

module.exports = new AdminService();
