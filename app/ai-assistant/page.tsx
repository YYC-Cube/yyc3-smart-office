'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

type Message = {
  id: number;
  sender: 'user' | 'ai';
  content: string;
};

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: 'ai',
      content: '你好！我是你的AI助理。有什么我可以帮助你的吗？',
    },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { id: messages.length + 1, sender: 'user', content: input }]);
      // 这里应该调用AI API来获取回复
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: 'ai',
            content: '我理解了你的问题。让我思考一下...',
          },
        ]);
      }, 1000);
      setInput('');
    }
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-6">AI助理</h1>

      <div className="flex-grow overflow-auto mb-4 bg-white rounded-lg shadow-inner p-4 tech-border">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="输入你的问题..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow"
        />
        <Button onClick={handleSend} className="btn-3d">
          <Send className="w-4 h-4 mr-2" />
          发送
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setInput('如何提高工作效率？')} className="btn-3d">
          如何提高工作效率？
        </Button>
        <Button variant="outline" onClick={() => setInput('帮我安排今天的日程')} className="btn-3d">
          帮我安排今天的日程
        </Button>
        <Button
          variant="outline"
          onClick={() => setInput('如何使用系统的OA审批功能？')}
          className="btn-3d"
        >
          如何使用系统的OA审批功能？
        </Button>
      </div>
    </div>
  );
}
