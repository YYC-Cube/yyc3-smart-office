import type React from 'react';
import { useState, useRef } from 'react';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type FileUploaderProps = {
  addWatermark: boolean;
};

export function FileUploader({ addWatermark }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 移除未使用的file状态设置
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        if (addWatermark) {
          addWatermarkToImage(reader.result as string);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const addWatermarkToImage = (imageSrc: string) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d') as CanvasRenderingContext2D | null;
    if (canvas && ctx) {
      // 使用浏览器原生的Image构造函数
      const img = new window.Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        ctx.font = '24px Arial';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText('Watermark', 20, 40);
        setPreview(canvas.toDataURL());
      };
      img.src = imageSrc;
    }
  };

  return (
    <div>
      <Label htmlFor="file-upload">上传图片</Label>
      <Input id="file-upload" type="file" onChange={handleFileChange} accept="image/*" />
      {preview && (
        <div className="mt-4">
          <Image 
            src={preview || '/placeholder.svg'} 
            alt="Preview" 
            className="max-w-full h-auto" 
            width={800} 
            height={600} 
            priority 
          />
        </div>
      )}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
