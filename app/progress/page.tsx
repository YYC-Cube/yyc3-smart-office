'use client';

import { Progress } from '@/components/ui/progress';

const projects = [
  { name: '产品开发', progress: 75 },
  { name: '市场营销', progress: 60 },
  { name: '客户服务', progress: 90 },
  { name: '财务管理', progress: 40 },
  { name: '人力资源', progress: 55 },
];

export default function ProgressTracker() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">落地情况跟踪</h1>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.name} className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">{project.name}</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
