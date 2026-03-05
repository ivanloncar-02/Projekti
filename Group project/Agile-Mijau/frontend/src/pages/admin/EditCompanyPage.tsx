import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { companyService } from '@/services/companyService';

interface FormData {
  name: string;
  oib: string;
  email: string;
  address: string;
  website: string;
  phone: string;
  contactPerson: string;
}

interface FormErrors {
  name?: string;
  oib?: string;
  email?: string;
  address?: string;
  website?: string;
  phone?: string;
}

const EditCompanyPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    oib: '',
    email: '',
    address: '',
    website: '',
    phone: '',
    contactPerson: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const company = await companyService.getById(id);
      setFormData({
        name: company.name || '',
        oib: company.oib || '',
        email: company.email || '',
        address: company.address || '',
        website: company.website || '',
        phone: company.phone || '',
        contactPerson: company.contactPerson || '',
      });
    } catch (error) {
      console.error('Failed to load company:', error);
      toast.error('Greška pri učitavanju tvrtke');
      navigate('/admin/companies');
    } finally {
      setIsLoading(false);
    }
  };

  const validateOib = (oib: string): boolean => {
    return /^\d{11}$/.test(oib);
  };

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Naziv tvrtke je obavezan';
    }

    if (!formData.oib.trim()) {
      newErrors.oib = 'OIB je obavezan';
    } else if (!validateOib(formData.oib)) {
      newErrors.oib = 'OIB mora imati točno 11 znamenki';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Neispravna email adresa';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Adresa je obavezna';
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Neispravan URL format (mora sadržavati http:// ili https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !id) {
      toast.error('Ispravite greške u formi');
      return;
    }

    setIsSubmitting(true);

    try {
      const companyData = {
        name: formData.name.trim(),
        oib: formData.oib.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        website: formData.website.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        contactPerson: formData.contactPerson.trim() || undefined,
      };

      await companyService.update(id, companyData);

      toast.success('Tvrtka uspješno ažurirana');
      navigate(`/admin/companies/${id}`);
    } catch (error) {
      console.error('Failed to update company:', error);
      const message = error instanceof Error ? error.message : 'Greška pri ažuriranju tvrtke';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Učitavanje...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate(`/admin/companies/${id}`)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Natrag na detalje
      </Button>

      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Uredi tvrtku</h1>
            <p className="text-sm text-muted-foreground">
              Ažurirajte podatke o tvrtki
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">
              Naziv tvrtke <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Unesite naziv tvrtke"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="oib">
              OIB <span className="text-red-500">*</span>
            </Label>
            <Input
              id="oib"
              type="text"
              value={formData.oib}
              onChange={(e) => handleInputChange('oib', e.target.value)}
              placeholder="11-znamenkasti OIB"
              maxLength={11}
              className={errors.oib ? 'border-red-500' : ''}
            />
            {errors.oib && (
              <p className="text-sm text-red-500">{errors.oib}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="tvrtka@primjer.hr"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              Adresa <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Unesite adresu tvrtke"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Web stranica</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.primjer.hr"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+385 XX XXX XXXX"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Kontakt osoba</Label>
            <Input
              id="contactPerson"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="Ime i prezime kontakt osobe"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Spremanje...' : 'Spremi promjene'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/companies/${id}`)}
              disabled={isSubmitting}
            >
              Odustani
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCompanyPage;
