'use client';

import type React from 'react';

import { useState } from 'react';
import { Tree, TreeNode } from '@/components/ui/tree';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
};

type Department = {
  id: string;
  name: string;
  children?: Department[];
};

export default function OrganizationStructure() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: '张三', role: '经理', department: '销售部' },
    { id: '2', name: '李四', role: '主管', department: '市场部' },
    { id: '3', name: '王五', role: '员工', department: '技术部' },
  ]);

  const [departments] = useState<Department[]>([
    {
      id: '1',
      name: '公司',
      children: [
        { id: '2', name: '销售部' },
        { id: '3', name: '市场部' },
        { id: '4', name: '技术部' },
      ],
    },
  ]);

  const [newEmployee, setNewEmployee] = useState({
    name: '',
    role: '',
    department: '',
  });

  const addEmployee = () => {
    if (newEmployee.name && newEmployee.role && newEmployee.department) {
      setEmployees([...employees, { id: String(employees.length + 1), ...newEmployee }]);
      setNewEmployee({ name: '', role: '', department: '' });
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">组织架构与权限管理</h1>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">组织架构</h2>
          <Tree>{renderDepartments(departments)}</Tree>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">员工管理</h2>
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">角色</Label>
                <Input
                  id="role"
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="department">部门</Label>
                <Select
                  value={newEmployee.department}
                  onValueChange={(value) => setNewEmployee({ ...newEmployee, department: value })}
                >
                  <option value="">选择部门</option>
                  {departments[0].children?.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <Button onClick={addEmployee}>添加员工</Button>
          </div>

          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">姓名</th>
                <th className="text-left">角色</th>
                <th className="text-left">部门</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id}>
                  <td>{employee.name}</td>
                  <td>{employee.role}</td>
                  <td>{employee.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function renderDepartments(departments: Department[]): React.ReactNode {
  return departments.map((department) => (
    <TreeNode key={department.id} label={department.name}>
      {department.children && renderDepartments(department.children)}
    </TreeNode>
  ));
}
