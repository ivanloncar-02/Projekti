import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddCompanyPage = () => {
  const navigate = useNavigate();
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

  const validateOib = (oib: string): boolean => {
    // OIB must be exactly 11 digits
    return /^\d{11}$/.test(oib);
  };

  const validateEmail = (email: string): boolean => {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Optional field
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
      newErrors.name = 'Company name is required';
    }

    if (!formData.oib.trim()) {
      newErrors.oib = 'OIB is required';
    } else if (!validateOib(formData.oib)) {
      newErrors.oib = 'OIB must be exactly 11 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (formData.website && !validateUrl(formData.website)) {
      newErrors.website = 'Invalid URL format (must include http:// or https://)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the validation errors');
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

      const newCompany = await companyService.create(companyData);

      toast.success('Company registered successfully', {
        description: `${newCompany.name} has been added to the system.`,
      });

      // Redirect to company detail page or companies list
      navigate(`/admin/companies/${newCompany.id}`);
    } catch (error) {
      console.error('Failed to create company:', error);
      const message = error instanceof Error ? error.message : 'Failed to register company';
      toast.error('Error', {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/admin/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Register New Company</h1>
            <p className="text-sm text-muted-foreground">
              Add a new company to the internship system
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter company name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* OIB */}
          <div className="space-y-2">
            <Label htmlFor="oib">
              OIB (Tax ID) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="oib"
              type="text"
              value={formData.oib}
              onChange={(e) => handleInputChange('oib', e.target.value)}
              placeholder="11-digit OIB number"
              maxLength={11}
              className={errors.oib ? 'border-red-500' : ''}
            />
            {errors.oib && (
              <p className="text-sm text-red-500">{errors.oib}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="company@example.com"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter company address"
              className={errors.address ? 'border-red-500' : ''}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              placeholder="https://www.example.com"
              className={errors.website ? 'border-red-500' : ''}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+385 XX XXX XXXX"
            />
          </div>

          {/* Contact Person */}
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              type="text"
              value={formData.contactPerson}
              onChange={(e) => handleInputChange('contactPerson', e.target.value)}
              placeholder="Enter contact person name"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register Company'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyPage;
