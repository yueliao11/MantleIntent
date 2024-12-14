import { useWallet } from "@/lib/WalletContext";
import { Download } from "lucide-react";

export function DownloadButton() {
  const { allocations } = useWallet();
  
  const handleDownload = () => {
    const jsonString = JSON.stringify(allocations, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wallet-allocations.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      <Download className="h-4 w-4" />
      导出资产分布
    </button>
  );
}