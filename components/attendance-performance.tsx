'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type EmployeePerformance = {
  id: number;
  name: string;
  department: string;
  attendanceDays: number;
  overtimeHours: number;
  lateCount: number;
  earlyLeaveCount: number;
  performance: number;
  contributionPoints: number;
};

const employeeData: EmployeePerformance[] = [
  {
    id: 1,
    name: '张三',
    department: '技术部',
    attendanceDays: 22,
    overtimeHours: 10,
    lateCount: 1,
    earlyLeaveCount: 0,
    performance: 95,
    contributionPoints: 120,
  },
  {
    id: 2,
    name: '李四',
    department: '市场部',
    attendanceDays: 21,
    overtimeHours: 5,
    lateCount: 2,
    earlyLeaveCount: 1,
    performance: 88,
    contributionPoints: 95,
  },
  {
    id: 3,
    name: '王五',
    department: '人事部',
    attendanceDays: 23,
    overtimeHours: 8,
    lateCount: 0,
    earlyLeaveCount: 0,
    performance: 98,
    contributionPoints: 135,
  },
  {
    id: 4,
    name: '赵六',
    department: '财务部',
    attendanceDays: 20,
    overtimeHours: 12,
    lateCount: 1,
    earlyLeaveCount: 2,
    performance: 85,
    contributionPoints: 100,
  },
  {
    id: 5,
    name: '钱七',
    department: '技术部',
    attendanceDays: 22,
    overtimeHours: 15,
    lateCount: 0,
    earlyLeaveCount: 1,
    performance: 92,
    contributionPoints: 110,
  },
];

export function AttendancePerformance() {
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const filteredData =
    selectedDepartment === 'all'
      ? employeeData
      : employeeData.filter((employee) => employee.department === selectedDepartment);

  const departments = ['all', ...new Set(employeeData.map((employee) => employee.department))];

  return (
    <Card className="w-full bg-white shadow-lg rounded-lg overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-2xl font-bold text-gray-800">
          考勤赋能业绩，业绩源于点滴
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择部门" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept === 'all' ? '所有部门' : dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="平均出勤天数"
            value={(
              filteredData.reduce((sum, employee) => sum + employee.attendanceDays, 0) /
              filteredData.length
            ).toFixed(1)}
          />
          <StatCard
            title="平均加班时长"
            value={(
              filteredData.reduce((sum, employee) => sum + employee.overtimeHours, 0) /
              filteredData.length
            ).toFixed(1)}
          />
          <StatCard
            title="迟到次数"
            value={filteredData.reduce((sum, employee) => sum + employee.lateCount, 0)}
          />
          <StatCard
            title="早退次数"
            value={filteredData.reduce((sum, employee) => sum + employee.earlyLeaveCount, 0)}
          />
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>员工姓名</TableHead>
              <TableHead>部门</TableHead>
              <TableHead>出勤天数</TableHead>
              <TableHead>加班时长</TableHead>
              <TableHead>迟到次数</TableHead>
              <TableHead>早退次数</TableHead>
              <TableHead>绩效得分</TableHead>
              <TableHead>贡献点数</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell>{employee.attendanceDays}</TableCell>
                <TableCell>{employee.overtimeHours}</TableCell>
                <TableCell>{employee.lateCount}</TableCell>
                <TableCell>{employee.earlyLeaveCount}</TableCell>
                <TableCell>
                  <Progress value={employee.performance} className="w-full" />
                  <span className="text-sm font-medium">{employee.performance}%</span>
                </TableCell>
                <TableCell>{employee.contributionPoints}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
        <p className="text-3xl font-bold text-blue-600">{value}</p>
      </CardContent>
    </Card>
  );
}
