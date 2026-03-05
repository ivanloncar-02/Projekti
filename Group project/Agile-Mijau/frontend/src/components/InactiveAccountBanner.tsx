import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export const InactiveAccountBanner = () => {
  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Račun deaktiviran</AlertTitle>
      <AlertDescription>
        Vaš račun je deaktiviran. Molimo kontaktirajte podršku za pomoć.
      </AlertDescription>
    </Alert>
  );
};
