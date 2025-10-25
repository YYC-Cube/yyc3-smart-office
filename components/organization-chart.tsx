'use client';

import { useEffect, useRef } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import { Card, CardContent } from '@/components/ui/card';

// 定义组织结构节点的类型接口
interface OrgNode {
  name: string;
  children?: OrgNode[];
}

const orgData: OrgNode = {
  name: 'CEO',
  children: [
    {
      name: '技术部',
      children: [{ name: '前端开发' }, { name: '后端开发' }, { name: '测试' }],
    },
    {
      name: '市场部',
      children: [{ name: '市场策划' }, { name: '品牌推广' }],
    },
    {
      name: '人事部',
      children: [{ name: '招聘' }, { name: '培训' }],
    },
    {
      name: '财务部',
      children: [{ name: '会计' }, { name: '审计' }],
    },
  ],
};

function renderTree(node: OrgNode): JSX.Element {
  return (
    <TreeNode
      label={
        <Card className="p-2">
          <CardContent className="p-2 text-center">{node.name}</CardContent>
        </Card>
      }
    >
      {node.children?.map((child: OrgNode, index: number) => (
        <div key={index}>{renderTree(child)}</div>
      ))}
    </TreeNode>
  );
}

export function OrganizationChart() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const svg = container.querySelector('svg');
      if (svg) {
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
      }
    }
  }, []);

  return (
    <div ref={containerRef} className="w-full overflow-auto organization-chart-container">
      <Tree
        lineWidth="2px"
        lineColor="#bbb"
        lineBorderRadius="10px"
        label={
          <Card className="p-2">
            <CardContent className="p-2 text-center font-bold">{orgData.name}</CardContent>
          </Card>
        }
      >
        {orgData.children?.map((child: OrgNode, index: number) => (
          <div key={index}>{renderTree(child)}</div>
        ))}
      </Tree>
    </div>
  );
}
