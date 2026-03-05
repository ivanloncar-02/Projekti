import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AccountStatusBadgeProps {
  isActive: boolean;
}

export const AccountStatusBadge = ({ isActive }: AccountStatusBadgeProps) => {
  if (isActive) {
    return (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        AKTIVAN
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="bg-gray-500 hover:bg-gray-600 text-white">
      <XCircle className="w-3 h-3 mr-1" />
      NEAKTIVAN
    </Badge>
  );
};
