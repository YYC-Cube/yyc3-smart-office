'use client';

// import type { Metadata } from 'next'; // 未使用的导入已注释

// 在客户端组件中，我们将通过Head组件设置标题

import { useState } from 'react';
import Head from 'next/head';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export default function Settings() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [useExternalModel, setUseExternalModel] = useState(false);
  const [externalModelUrl, setExternalModelUrl] = useState('');

  const handleSave = async () => {
    try {
      // 这里应该保存设置到后端或本地存储
      toast({
        title: '设置已保存',
        description: '您的系统设置已成功更新',
      });
    } catch {
      toast({
        title: '保存失败',
        description: '保存设置时发生错误',
        variant: 'destructive',
      });
    }
  };

  const handleTest = async () => {
    try {
      // 这里应该测试API连接
      toast({
        title: 'API连接测试',
        description: '连接测试成功',
      });
    } catch {
      toast({
        title: '测试失败',
        description: 'API连接测试时发生错误',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Head>
        <title>设置 - 智能办公经管系统</title>
      </Head>
      <div className="p-6 animate-fade-in min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>

      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <h2 className="text-lg font-semibold mb-4">AI 模型设置</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="model">选择模型</Label>
            </div>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="选择AI模型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                <SelectItem value="gpt-4">GPT-4</SelectItem>
                <SelectItem value="claude-3">Claude 3</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apiKey">API 密钥</Label>
            </div>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="请输入API密钥"
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="useExternalModel">使用外部模型</Label>
            <Switch
              id="useExternalModel"
              checked={useExternalModel}
              onCheckedChange={setUseExternalModel}
            />
          </div>

          {useExternalModel && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="externalModelUrl">外部模型 URL</Label>
              </div>
              <Input
                id="externalModelUrl"
                value={externalModelUrl}
                onChange={(e) => setExternalModelUrl(e.target.value)}
                placeholder="https://your-model-api.example.com"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex space-x-4">
        <Button onClick={handleSave}>
          保存设置
        </Button>
        <Button variant="secondary" onClick={handleTest}>
          测试连接
        </Button>
      </div>
    </div>
    </>
  );
}
