import { NextRequest } from 'next/server';
import { z } from 'zod';
import { withApiHandler, createApiResponse } from '@/lib/api-middleware';

// 提醒项目类型
export interface ReminderItem {
  id: string;
  content: string;
  date: string;
  time: string;
  completed: boolean;
  assignedTo: string;
}

// 请求验证schema
const reminderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      date: z.string(),
      time: z.string(),
      completed: z.boolean(),
      assignedTo: z.string(),
    })
  ),
  csrfToken: z.string(),
});

// 提醒处理函数
const reminderHandler = async (_req: NextRequest, data: z.infer<typeof reminderSchema>) => {
  try {
    const now = new Date();
    const reminders: Array<{ type: 'reminder' | 'escalation'; message: string; newAssignee?: string; itemId?: string }> = [];

    data.items.forEach((item) => {
      if (!item.completed) {
        const itemDate = new Date(`${item.date}T${item.time}`);
        const timeDiff = now.getTime() - itemDate.getTime();
        const minutesDiff = Math.floor(timeDiff / 60000);

        if (minutesDiff >= 0 && minutesDiff < 1) {
          reminders.push({
            type: 'reminder',
            message: `${item.content} 的时间到了！`,
          });
        } else if (minutesDiff >= 15 && minutesDiff < 16 && item.assignedTo === '员工') {
          reminders.push({
            type: 'escalation',
            message: `${item.content} 已超时15分钟，已升级至直属管理。`,
            newAssignee: '直属管理',
            itemId: item.id,
          });
        } else if (minutesDiff >= 30 && minutesDiff < 31 && item.assignedTo === '直属管理') {
          reminders.push({
            type: 'escalation',
            message: `${item.content} 已超时30分钟，已升级至门店副总。`,
            newAssignee: '门店副总',
            itemId: item.id,
          });
        }
      }
    });

    return createApiResponse({ reminders }, {
      status: 200,
      message: '提醒检查完成',
    });
  } catch (error) {
    console.error('提醒处理错误:', error);
    throw error;
  }
};

export const POST = withApiHandler(reminderHandler, {
  schema: reminderSchema,
  method: 'POST',
  validateCsrf: true,
});
