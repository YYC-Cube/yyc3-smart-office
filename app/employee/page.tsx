'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';

const AttendancePerformance = dynamic(() => import('@/components/attendance-performance').then((mod) => mod.AttendancePerformance), {
  ssr: false,
});
const MultiDimensionalDashboard = dynamic(
  () => import('@/components/multi-dimensional-dashboard').then((mod) => mod.MultiDimensionalDashboard),
  { ssr: false },
);
const OrganizationChart = dynamic(() => import('@/components/organization-chart').then((mod) => mod.OrganizationChart), { ssr: false });
const EmployeeHonorFund = dynamic(() => import('@/components/employee-honor-fund').then((mod) => mod.EmployeeHonorFund), { ssr: false });
const GroupInteractions = dynamic(() => import('@/components/group-interactions').then((mod) => mod.GroupInteractions), { ssr: false });
const PaymentChannels = dynamic(() => import('@/components/payment-channels').then((mod) => mod.PaymentChannels), {
  ssr: false,
});

export default function EmployeePage() {
  const [activeTab, setActiveTab] = useState('attendance');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">员工管理</h1>
      <p className="text-lg text-gray-600 mb-6 italic">&quot;一朝一暮一努力·一言一语一人生&quot;</p>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          <TabsTrigger value="attendance" className="btn-3d">
            考勤业绩
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="btn-3d">
            多维看板
          </TabsTrigger>
          <TabsTrigger value="organization" className="btn-3d">
            组织架构
          </TabsTrigger>
          <TabsTrigger value="honor-fund" className="btn-3d">
            荣誉基金
          </TabsTrigger>
          <TabsTrigger value="group-interactions" className="btn-3d">
            群内互动
          </TabsTrigger>
          <TabsTrigger value="payment-channels" className="btn-3d">
            收款通道
          </TabsTrigger>
        </TabsList>
        <TabsContent value="attendance">
          <AttendancePerformance />
        </TabsContent>
        <TabsContent value="dashboard">
          <MultiDimensionalDashboard />
        </TabsContent>
        <TabsContent value="organization">
          <OrganizationChart />
        </TabsContent>
        <TabsContent value="honor-fund">
          <EmployeeHonorFund />
        </TabsContent>
        <TabsContent value="group-interactions">
          <GroupInteractions />
        </TabsContent>
        <TabsContent value="payment-channels">
          <PaymentChannels />
        </TabsContent>
      </Tabs>
    </div>
  );
}
