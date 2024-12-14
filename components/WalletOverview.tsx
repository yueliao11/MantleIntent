"use client";

import { Card } from "@/components/ui/card";
import { useWallet } from "@/lib/WalletContext";
import { useEffect, useState, useRef } from "react";
import { useI18n } from '@/lib/i18n/I18nContext';
import * as echarts from 'echarts';
import 'echarts-gl';
import { useTheme } from "next-themes";
import { AssetAllocation } from "./AssetAllocation";

export function WalletOverview() {
  const { t } = useI18n();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts>();
  const [totalValue, setTotalValue] = useState(0);
  const { theme } = useTheme();
  const handleAssetsUpdate = (assets: TokenBalance[]) => {
    if (!assets?.length) {
      setTotalValue(0);
      return;
    }

    const data = assets.map(asset => ({
      name: asset.symbol,
      value: Number((parseFloat(asset.balance) * (asset.price || 0)).toFixed(2))
    }));
    // console.log('data--', data);
    // TODO: 暂时切换mock数据
    setTotalValue(data.reduce((sum, item) => sum + item.value, 0));

    if (chartInstance.current) {
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'item',
          formatter: '{b}: ${c}'
        },
        series: [{
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['50%', '50%'],
          startAngle: 180,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n${c}',
            fontSize: 14,
            color: theme === 'dark' ? '#fff' : '#000',
            distance: 20
          },
          itemStyle: {
            borderWidth: 2,
            borderRadius: 10,
            borderColor: theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            color: (params: any) => generateGradientColor(params.dataIndex, data.length)
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 15,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              borderWidth: 3,
              borderColor: theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
            }
          },
          data: data
        }]
      };

      // 添加3D效果配置
      option.series[0].viewControl = {
        alpha: 40,
        beta: 40,
        rotateSensitivity: 0,
        zoomSensitivity: 0
      };

      option.series[0].shading = 'realistic';
      option.series[0].light = {
        main: {
          intensity: 1.2,
          shadow: true
        },
        ambient: {
          intensity: 0.3
        }
      };

      // 添加背景星星效果
      option.graphic = {
        elements: Array.from({ length: 20 }, () => ({
          type: 'circle',
          shape: {
            r: Math.random() * 2
          },
          style: {
            fill: '#fff'
          },
          position: [
            Math.random() * chartRef.current.clientWidth,
            Math.random() * chartRef.current.clientHeight
          ]
        }))
      };

      chartInstance.current.setOption(option);
    }
  };
  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, []);

  return (
    <Card className="p-12">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="font-[700] text-[20px] leading-[37px] text-[#0F0F0F] font-sans">
            {t('asset.allocation.value')}
          </div>

        </div>
        <div className="text-[40px] font-bold">
          <span className="text-[#000000]">$</span>{" "}<span className="text-[#2C4BF5]">{totalValue.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div
          className="h-[400px] bg-gradient-to-b from-indigo-50/30 to-transparent dark:from-indigo-950/30"
          ref={chartRef}
        />
        <div className="mt-6" style={{ display: 'none' }}>
          <AssetAllocation onAssetsUpdate={handleAssetsUpdate} hidden={true} />
        </div>
      </div>
    </Card>
  );
}

// 添加资产颜色映射函数
function getAssetColor(symbol: string) {
  const colors = {
    ETH: '#6366f1',    // Indigo
    USDT: '#22c55e',   // Green  
    BTC: '#f59e0b',    // Amber
    // 添加更多资产颜色映射
  };
  return colors[symbol] || '#94a3b8'; // 默认颜色
}

const generateGradientColor = (index: number, total: number) => {
  // 使用黄金角度来分配颜色，确保颜色分布均匀
  const hue = (index * 137.508) % 360;  // 黄金角度约为137.508度
  
  // 为每个扇区创建渐变色
  return {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [{
      offset: 0,
      color: `hsla(${hue}, 80%, 65%, 0.9)` // 亮色起始
    }, {
      offset: 1,
      color: `hsla(${hue}, 70%, 45%, 0.9)` // 深色结束
    }]
  };
};