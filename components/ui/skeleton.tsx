import { cn } from '@/lib/utils';

interface Props {
  count?: number; // 用于控制骨架屏数量的参数
  className?: string; // 允许传递 className 来自定义样式
}

function Skeleton({
  count=1,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & Props) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {/* 根据 count 渲染相应数量的骨架条目 */}
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-4">
          <div className="h-6 bg-gray-300 animate-pulse rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 animate-pulse rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 animate-pulse rounded w-5/6"></div>
        </div>
      ))}
    </div>
  );
}

export { Skeleton };
