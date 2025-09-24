import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Activity } from '../../types';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';

interface DepartmentData {
  department: string;
  count: number;
  percentage: number;
}

const DepartmentAnalytics: React.FC = () => {
  const [departmentData, setDepartmentData] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  // Colors for the pie chart
  const COLORS = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', 
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ];

  useEffect(() => {
    const activitiesQuery = query(collection(db, 'activities'));
    const unsubscribe = onSnapshot(activitiesQuery, (snapshot) => {
      const activities: Activity[] = [];
      const departmentCounts: { [key: string]: number } = {};
      
      snapshot.forEach((doc) => {
        const activity = { id: doc.id, ...doc.data() } as Activity;
        activities.push(activity);
        
        // Count activities by department
        const department = activity.studentDepartment || 'Unknown Department';
        departmentCounts[department] = (departmentCounts[department] || 0) + 1;
      });
      
      // Calculate total activities
      const totalActivities = activities.length;
      
      // Convert to array and calculate percentages
      const departmentArray = Object.entries(departmentCounts)
        .map(([department, count]) => ({
          department,
          count,
          percentage: totalActivities > 0 ? Number(((count / totalActivities) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.count - a.count); // Sort by count descending
      
      setDepartmentData(departmentArray);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600">
            Activities: <span className="font-semibold">{payload[0].value}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-semibold">{payload[0].payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-blue-600">
            Activities: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-gray-600">
            Percentage: <span className="font-semibold">{data.payload.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="rounded-xl border glass-panel">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Department Analytics</h2>
        </div>
        <div className="p-8 text-center">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (departmentData.length === 0) {
    return (
      <div className="rounded-xl border glass-panel">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Department Analytics</h2>
        </div>
        <div className="p-8 text-center text-gray-500">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No department data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border glass-panel">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Department Analytics</h2>
        </div>
        <p className="text-sm text-gray-600 mt-1">Activity submissions grouped by department</p>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart className="h-4 w-4 mr-2" />
              Activities by Department
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="department" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    className="hover:opacity-80 transition-opacity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div>
            <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Department Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Department Summary Table */}
        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-900 mb-4">Department Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Department</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Activities</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {departmentData.map((dept, index) => (
                  <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium text-gray-900">{dept.department}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-semibold text-gray-900">{dept.count}</td>
                    <td className="text-right py-3 px-4 text-gray-600">{dept.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnalytics;
