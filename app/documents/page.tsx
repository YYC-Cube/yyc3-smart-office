'use client';

import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Search,
  Upload,
  FolderPlus,
  Download,
  Eye,
  MoreHorizontal,
  SlidersHorizontal,
  FileText,
  FileImage,
  File,
  Clock,
  Share2,
  Star,
  StarOff,
  Lock,
  Unlock,
  FolderTree,
}
from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { FileUploader } from '@/components/file-uploader';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';

// 定义文档类型
interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'doc' | 'excel' | 'image' | 'text';
  size: string;
  createdBy: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  modifiedAt: string;
  status: 'draft' | 'published' | 'archived';
  category: string;
  starred: boolean;
  access: 'public' | 'private' | 'shared';
  previewUrl?: string;
}

// 定义文件夹类型
interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  createdBy: {
    name: string;
    avatar: string;
  };
  documentCount: number;
}

// 模拟文档数据
const mockDocuments: Document[] = [
  {
    id: '1',
    title: '2023年度财务报告',
    type: 'pdf',
    size: '2.4 MB',
    createdBy: {
      name: '张三',
      avatar: 'https://ui-avatars.com/api/?name=张三&background=random',
    },
    createdAt: '2023-06-15',
    modifiedAt: '2023-06-15',
    status: 'published',
    category: '财务',
    starred: true,
    access: 'private',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '2',
    title: '产品设计规范',
    type: 'doc',
    size: '1.8 MB',
    createdBy: {
      name: '李四',
      avatar: 'https://ui-avatars.com/api/?name=李四&background=random',
    },
    createdAt: '2023-06-14',
    modifiedAt: '2023-06-16',
    status: 'published',
    category: '设计',
    starred: false,
    access: 'public',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '3',
    title: '市场调研报告Q2',
    type: 'excel',
    size: '3.2 MB',
    createdBy: {
      name: '王五',
      avatar: 'https://ui-avatars.com/api/?name=王五&background=random',
    },
    createdAt: '2023-06-13',
    modifiedAt: '2023-06-13',
    status: 'draft',
    category: '市场',
    starred: true,
    access: 'shared',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '4',
    title: '产品Logo设计',
    type: 'image',
    size: '4.5 MB',
    createdBy: {
      name: '赵六',
      avatar: 'https://ui-avatars.com/api/?name=赵六&background=random',
    },
    createdAt: '2023-06-12',
    modifiedAt: '2023-06-15',
    status: 'published',
    category: '设计',
    starred: false,
    access: 'public',
    previewUrl: '/placeholder.svg',
  },
  {
    id: '5',
    title: '项目实施计划',
    type: 'doc',
    size: '1.2 MB',
    createdBy: {
      name: '张三',
      avatar: 'https://ui-avatars.com/api/?name=张三&background=random',
    },
    createdAt: '2023-06-10',
    modifiedAt: '2023-06-14',
    status: 'published',
    category: '项目',
    starred: false,
    access: 'shared',
    previewUrl: '/placeholder.svg',
  },
];

// 模拟文件夹数据
const mockFolders: Folder[] = [
  {
    id: '1',
    name: '项目文档',
    parentId: null,
    createdAt: '2023-06-01',
    createdBy: {
      name: '管理员',
      avatar: 'https://ui-avatars.com/api/?name=管理员&background=random',
    },
    documentCount: 12,
  },
  {
    id: '2',
    name: '财务报表',
    parentId: null,
    createdAt: '2023-05-15',
    createdBy: {
      name: '管理员',
      avatar: 'https://ui-avatars.com/api/?name=管理员&background=random',
    },
    documentCount: 8,
  },
  {
    id: '3',
    name: '产品设计',
    parentId: null,
    createdAt: '2023-05-10',
    createdBy: {
      name: '管理员',
      avatar: 'https://ui-avatars.com/api/?name=管理员&background=random',
    },
    documentCount: 15,
  },
];

// 获取文档图标
const getDocumentIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <File className="h-5 w-5 text-red-500" />;
    case 'doc':
      return <File className="h-5 w-5 text-blue-500" />;
    case 'excel':
      return <File className="h-5 w-5 text-green-500" />;
    case 'image':
      return <FileImage className="h-5 w-5 text-purple-500" />;
    case 'text':
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

// 获取访问权限图标
const getAccessIcon = (access: string) => {
  switch (access) {
    case 'private':
      return <Lock className="h-4 w-4 text-gray-500" />;
    case 'shared':
      return <Share2 className="h-4 w-4 text-blue-500" />;
    case 'public':
    default:
      return <Unlock className="h-4 w-4 text-green-500" />;
  }
};

export default function DocumentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [fileUploadProgress, setFileUploadProgress] = useState(0);
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    category: '项目',
  });
  const [addWatermark, setAddWatermark] = useState(false);

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 模拟API请求延迟
        await new Promise(resolve => setTimeout(resolve, 800));
        setDocuments(mockDocuments);
        setFolders(mockFolders);
      } catch {
        toast({ title: '加载失败', description: '无法加载文档数据', variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // 过滤文档
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || doc.category === filterCategory;
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'starred' && doc.starred) ||
                      (activeTab === 'recent' && new Date(doc.modifiedAt) > new Date('2023-06-13'));

    return matchesSearch && matchesCategory && matchesTab;
  });

  // 切换星标状态
  const toggleStar = (id: string) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, starred: !doc.starred } : doc
      )
    );
  };

  // 预览文档
  const previewDocument = (doc: Document) => {
    setCurrentDocument(doc);
    setIsPreviewDialogOpen(true);
  };

  // 下载文档
  const downloadDocument = (doc: Document) => {
    // 模拟下载进度
    setFileUploadProgress(0);
    const interval = setInterval(() => {
      setFileUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          toast({ title: '下载成功', description: `${doc.title} 已下载` });
          return 0;
        }
        return prev + 10;
      });
    }, 200);
  };

  // 添加新文件夹
  const addFolder = () => {
    if (!newFolderName.trim()) {
      toast({ title: '错误', description: '文件夹名称不能为空', variant: 'destructive' });
      return;
    }

    const folder: Folder = {
      id: String(folders.length + 1),
      name: newFolderName,
      parentId: null,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: {
        name: user?.name || '用户',
        avatar: `https://ui-avatars.com/api/?name=${user?.name || '用户'}&background=random`,
      },
      documentCount: 0,
    };

    setFolders([...folders, folder]);
    setNewFolderName('');
    setIsFolderDialogOpen(false);
    toast({ title: '创建成功', description: `文件夹 "${folder.name}" 已创建` });
  };

  // 创建新文档
  const createDocument = () => {
    if (!newDocument.title.trim()) {
      toast({ title: '错误', description: '文档标题不能为空', variant: 'destructive' });
      return;
    }

    const doc: Document = {
      id: String(documents.length + 1),
      title: newDocument.title,
      type: 'text',
      size: `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 9) + 1} MB`,
      createdBy: {
        name: user?.name || '用户',
        avatar: `https://ui-avatars.com/api/?name=${user?.name || '用户'}&background=random`,
      },
      createdAt: new Date().toISOString().split('T')[0],
      modifiedAt: new Date().toISOString().split('T')[0],
      status: 'draft',
      category: newDocument.category,
      starred: false,
      access: 'private',
      previewUrl: '/placeholder.svg',
    };

    setDocuments([doc, ...documents]);
    setNewDocument({ title: '', content: '', category: '项目' });
    setIsUploadDialogOpen(false);
    toast({ title: '创建成功', description: `文档 "${doc.title}" 已创建` });
  };

  // 获取所有分类
  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category)))];

  return (
    <>
      <Head>
        <title>文档管理 - YYC 智能办公</title>
        <meta name="description" content="企业文档的集中管理和查阅系统，支持文档上传、分类、搜索和权限控制。" />
      </Head>
      <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-gray-800">文档管理中心</h1>
            <p className="text-gray-600">集中管理、搜索和共享企业文档资源</p>
          </div>

          {/* 工具栏 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="搜索文档..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setIsUploadDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Upload size={16} />
                <span>上传/创建</span>
              </Button>
              <Button 
                onClick={() => setIsFolderDialogOpen(true)}
                className="flex items-center gap-2"
                variant="secondary"
              >
                <FolderPlus size={16} />
                <span>新建文件夹</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon">
                    <SlidersHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>按名称排序</DropdownMenuItem>
                  <DropdownMenuItem>按日期排序</DropdownMenuItem>
                  <DropdownMenuItem>按大小排序</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>导出列表</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 过滤和标签页 */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-600">分类:</span>
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={filterCategory === category ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setFilterCategory(category)}
                >
                  {category === 'all' ? '全部' : category}
                </Badge>
              ))}
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">全部文档</TabsTrigger>
                <TabsTrigger value="starred">星标文档</TabsTrigger>
                <TabsTrigger value="recent">最近修改</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* 文件夹列表 */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <FolderTree size={20} />
              文件夹
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {folders.map((folder) => (
                <Card key={folder.id} className="transition-all hover:shadow-md cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{folder.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>重命名</DropdownMenuItem>
                          <DropdownMenuItem>移动</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500">删除</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>
                      {folder.documentCount} 个文档
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>创建于 {folder.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={folder.createdBy.avatar} alt={folder.createdBy.name} />
                        <AvatarFallback>{folder.createdBy.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-600">{folder.createdBy.name}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 文档列表 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl">文档列表</CardTitle>
              <div className="text-sm text-gray-600">
                共 {filteredDocuments.length} 个文档
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-6 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-medium mb-2">未找到文档</h3>
                  <p>尝试调整搜索条件或创建新文档</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">类型</TableHead>
                      <TableHead>标题</TableHead>
                      <TableHead className="hidden md:table-cell">分类</TableHead>
                      <TableHead className="hidden md:table-cell">大小</TableHead>
                      <TableHead className="hidden lg:table-cell">创建者</TableHead>
                      <TableHead className="hidden xl:table-cell">修改日期</TableHead>
                      <TableHead className="w-[100px]">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDocuments.map((doc) => (
                      <TableRow key={doc.id} className="group hover:bg-gray-50">
                        <TableCell>
                          {getDocumentIcon(doc.type)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {doc.starred ? (
                              <Star className="h-4 w-4 text-yellow-500 cursor-pointer" onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(doc.id);
                              }} />
                            ) : (
                              <StarOff className="h-4 w-4 text-gray-300 cursor-pointer hover:text-yellow-500 group-hover:text-gray-400" onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(doc.id);
                              }} />
                            )}
                            {doc.title}
                            {getAccessIcon(doc.access)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            创建于 {doc.createdAt}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="outline" className="bg-gray-100">
                            {doc.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{doc.size}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={doc.createdBy.avatar} alt={doc.createdBy.name} />
                              <AvatarFallback>{doc.createdBy.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span>{doc.createdBy.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">{doc.modifiedAt}</TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-blue-600"
                              onClick={() => previewDocument(doc)}
                            >
                              <Eye size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-gray-500 hover:text-green-600"
                              onClick={() => downloadDocument(doc)}
                            >
                              <Download size={16} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-gray-500 hover:text-gray-700"
                                >
                                  <MoreHorizontal size={16} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>重命名</DropdownMenuItem>
                                <DropdownMenuItem>移动到</DropdownMenuItem>
                                <DropdownMenuItem>共享</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-500">删除</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 上传/创建文档对话框 */}
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>上传/创建文档</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="document-title">文档标题</Label>
                  <Input
                    id="document-title"
                    value={newDocument.title}
                    onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                    placeholder="请输入文档标题"
                  />
                </div>
                <div>
                  <Label htmlFor="document-category">分类</Label>
                  <select
                    id="document-category"
                    className="w-full p-2 border rounded"
                    value={newDocument.category}
                    onChange={(e) => setNewDocument({...newDocument, category: e.target.value})}
                  >
                    {categories.filter(c => c !== 'all').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="document-content">文档内容（可选）</Label>
                  <Textarea
                    id="document-content"
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                    placeholder="请输入文档内容"
                    rows={5}
                  />
                </div>
                <div>
                  <Label>上传附件（可选）</Label>
                  <FileUploader addWatermark={addWatermark} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="watermark"
                    checked={addWatermark}
                    onCheckedChange={setAddWatermark}
                  />
                  <Label htmlFor="watermark">为图片添加水印</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsUploadDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={createDocument}>
                创建文档
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 新建文件夹对话框 */}
        <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>新建文件夹</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="folder-name">文件夹名称</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="请输入文件夹名称"
                    autoFocus
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsFolderDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={addFolder}>
                创建
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 文档预览对话框 */}
        <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-auto">
            {currentDocument && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {getDocumentIcon(currentDocument.type)}
                    {currentDocument.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <div className="mb-4 p-3 bg-gray-100 rounded-md flex flex-wrap gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">类型:</span>
                      <Badge variant="outline">{currentDocument.type.toUpperCase()}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">大小:</span>
                      <span>{currentDocument.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">分类:</span>
                      <Badge variant="outline">{currentDocument.category}</Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">创建者:</span>
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={currentDocument.createdBy.avatar} />
                          <AvatarFallback>{currentDocument.createdBy.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{currentDocument.createdBy.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">创建日期:</span>
                      <span>{currentDocument.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">修改日期:</span>
                      <span>{currentDocument.modifiedAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">状态:</span>
                      <Badge variant={currentDocument.status === 'published' ? 'default' : currentDocument.status === 'draft' ? 'secondary' : 'destructive'}>
                        {currentDocument.status === 'published' ? '已发布' : currentDocument.status === 'draft' ? '草稿' : '已归档'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">访问权限:</span>
                      <Badge variant={currentDocument.access === 'public' ? 'default' : currentDocument.access === 'private' ? 'secondary' : 'outline'}>
                        {currentDocument.access === 'public' ? '公开' : currentDocument.access === 'private' ? '私有' : '共享'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="bg-white border rounded-lg p-6 min-h-[400px]">
                    {currentDocument.type === 'image' ? (
                      <div className="flex justify-center">
                        <Image 
                          src={currentDocument.previewUrl || '/placeholder.svg'} 
                          alt={currentDocument.title} 
                          className="max-h-[500px] max-w-full object-contain"
                          width={1200}
                          height={800}
                          priority
                        />
                      </div>
                    ) : (
                      <div className="prose max-w-none">
                        <h2 className="text-xl font-semibold mb-4">{currentDocument.title}</h2>
                        <p className="text-gray-600 mb-4">
                          文档预览内容将在此显示。这是一个示例预览，实际应用中会根据文档类型显示相应的内容预览。
                        </p>
                        <p className="text-gray-600">
                          文档创建于 {currentDocument.createdAt}，最后修改于 {currentDocument.modifiedAt}。
                          由 {currentDocument.createdBy.name} 创建并分享给您。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="secondary" onClick={() => setIsPreviewDialogOpen(false)}>
                    关闭
                  </Button>
                  <Button onClick={() => downloadDocument(currentDocument)}>
                    <Download size={16} className="mr-2" />
                    下载文档
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 上传/下载进度指示器 */}
        {fileUploadProgress > 0 && fileUploadProgress < 100 && (
          <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">正在处理...</span>
              <span className="text-sm text-gray-500">{fileUploadProgress}%</span>
            </div>
            <Progress value={fileUploadProgress} className="h-2" />
          </div>
        )}
      </div>
    </>
  );
}
