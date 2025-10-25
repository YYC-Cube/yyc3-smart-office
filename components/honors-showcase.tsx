'use client';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Honor = {
  id: number;
  title: string;
  description: string;
  image: string;
  type: 'image' | 'video';
  category: string;
};

const honors: Honor[] = [
  {
    id: 1,
    title: '年度最佳团队',
    description: '技术部在项目交付中表现卓越',
    image: '/team-award.png',
    type: 'image',
    category: '团队荣誉',
  },
  {
    id: 2,
    title: '创新奖',
    description: '市场部推出的新营销策略取得显著成效',
    image: '/innovation-award.png',
    type: 'image',
    category: '公司奖项',
  },
  {
    id: 3,
    title: '客户满意度冠军',
    description: '客服团队连续三个季度获得最高评分',
    image: '/customer-satisfaction-award.png',
    type: 'image',
    category: '团队荣誉',
  },
  {
    id: 4,
    title: '节能环保奖',
    description: '公司在减少碳排放方面的突出贡献',
    image: '/environmental-award.png',
    type: 'image',
    category: '公司奖项',
  },
];

export function HonorsShowcase() {
  return (
    <Card className="glass-card overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 gradient-text text-center">优秀及荣誉展示</h2>
        <Carousel className="w-full">
          <CarouselContent>
            {honors.map((honor) => (
              <CarouselItem key={honor.id} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden hover-lift transition-all duration-300">
                    <CardContent className="p-0">
                      <div className="relative">
                        {honor.type === 'image' ? (
                          <Image
                            src={honor.image || '/placeholder.svg'}
                            alt={honor.title}
                            width={600}
                            height={400}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <video src={honor.image} controls className="w-full h-48 object-cover">
                            Your browser does not support the video tag.
                          </video>
                        )}
                        <Badge className="absolute top-2 right-2" variant="secondary">
                          {honor.category}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{honor.title}</h3>
                        <p className="text-sm text-gray-600">{honor.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      </div>
    </Card>
  );
}
