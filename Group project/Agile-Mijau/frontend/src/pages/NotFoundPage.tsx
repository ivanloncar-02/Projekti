import React from 'react';
import { Link } from 'react-router-dom';
import { croatianTranslations } from '../translations/croatian';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          {croatianTranslations.common.notFound}
        </h2>
        <p className="text-gray-600 mb-8">
          Tražena stranica ne postoji ili je premještena.
        </p>
        <Link
          to="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {croatianTranslations.common.back}
        </Link>
      </div>
    </div>
  );
};
