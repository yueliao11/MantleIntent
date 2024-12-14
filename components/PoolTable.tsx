import React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'; // 假设文件名为 TableComponents
import { useI18n } from '@/lib/i18n/I18nContext';
import poolDataDemo from './poolDataDemo.json';
import poolDataDemo1 from './poolDataDemo1.json';
import { Card } from './ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./ui/tooltip";

interface IPoolInfo {
  tokenName: string;
  tokenAddress: string;
  tokenImg: string;
}

interface IRowProps {
  pool: [IPoolInfo, IPoolInfo];
  protocol: {
    name: string;
    image: string;
    url: string;
  },
  liquidity: string;
  volume: string;
  fee: string;
  miningReward: string;
  apr: string;
}

export const PoolTable = () => {
  const { t } = useI18n();
  const DataRow = (props: IRowProps) => {
    const { pool, liquidity, volume, fee, miningReward, apr, protocol } = props;

    return (
      <TableRow key={`${protocol.name}-${pool[0].tokenAddress}${pool[1]?.tokenAddress ? `-${pool[1].tokenAddress}` : ''}`}>
        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip>
              <TooltipTrigger asChild>
                <img src={protocol?.image} alt={protocol?.name} className="w-[24px] h-[24px] mr-8" />
              </TooltipTrigger>
              <TooltipContent side="top" sideOffset={5}>
                <a
                  href="https://example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline hover:text-blue-700"
                >
                  Go to Example.com
                </a>
              </TooltipContent>
            </Tooltip>
          </div>
        </TableCell>
        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={pool[0].tokenImg} alt={pool[0].tokenName} style={{ width: 24, height: 24, marginRight: 8 }} />
            {
              pool[1] ?
                <img src={pool[1].tokenImg} alt={pool[1].tokenName} style={{ width: 24, height: 24, marginRight: 8 }} />
                : null
            }
          </div>
        </TableCell>
        <TableCell>{liquidity}</TableCell>
        <TableCell>{volume}</TableCell>
        <TableCell>{apr}</TableCell>
      </TableRow>
    );
  };
  const TableData = (props: {
    data: IRowProps[]
  }) => {
    return <div className="p-0 rounded-md max-h-[600px] overflow-y-auto">
      <Table className='w-full'>
        <TableHeader>
          <TableRow className="bg-[rgba(251,251,251,0.8)] shadow-[0px_4px_25.7px_rgba(153,153,153,0.13)] backdrop-blur-sm !border-b-0">
            <TableHead className="rounded-tl-2xl rounded-bl-2xl">{t("Protocols")}</TableHead>
            <TableHead >{t("Pools")}</TableHead>
            <TableHead >{t("Liquidity")}</TableHead>
            <TableHead >{t("Volume (24H)")}</TableHead>
            <TableHead className="rounded-tr-2xl rounded-br-2xl">{t("APY")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {props.data.map((item, index) => (
            <DataRow
              key={`${item.protocol.name}-${item.pool[0].tokenAddress}${item.pool[1]?.tokenAddress ? `-${item.pool[1].tokenAddress}` : ''}`}
              {...item}
            />
          ))}
        </TableBody>
      </Table>

    </div>
  }
  return (
    <TooltipProvider>
      <Card>
        <div>
          <h2 className="font-semibold text-2xl mb-6">{t('wallet.overview.defi')}</h2>
        </div>
        <TableData data={poolDataDemo as unknown as IRowProps[]} />
      </Card>
    </TooltipProvider>

  );
};
