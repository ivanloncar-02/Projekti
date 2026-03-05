import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <ShieldAlert className="h-24 w-24 text-red-600" strokeWidth={1.5} />
            <AlertCircle className="h-10 w-10 text-red-700 absolute -bottom-1 -right-1" />
          </div>
        </div>

        <h1 className="text-6xl font-bold text-red-600 mb-4">403</h1>

        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Pristup odbijen
        </h2>

        <p className="text-gray-600 mb-2">
          Nemate dozvolu za pristup ovoj stranici.
        </p>

        <p className="text-sm text-gray-500 mb-8">
          Molimo kontaktirajte administratora ako mislite da je ovo greška.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={handleGoBack}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
          >
            Nazad
          </Button>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Početna stranica
          </Button>
        </div>
      </div>
    </div>
  );
};
