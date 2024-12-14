import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

export function ImportExportButtons() {
  const handleExport = () => {
    const cache = localStorage.getItem('moralis_assets');
    if (cache) {
      const blob = new Blob([cache], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'wallet_assets.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content);
            localStorage.setItem('moralis_assets', JSON.stringify(data));
            window.location.reload(); // 刷新页面以加载新数据
          } catch (error) {
            console.error('导入失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleExport}
      >
        <Download className="h-4 w-4 mr-2" />
        导出资产数据
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleImport}
      >
        <Upload className="h-4 w-4 mr-2" />
        导入资产数据
      </Button>
    </div>
  );
}