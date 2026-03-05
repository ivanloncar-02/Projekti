import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  message?: string;
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;

  return (
    <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
      <AlertCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
};
