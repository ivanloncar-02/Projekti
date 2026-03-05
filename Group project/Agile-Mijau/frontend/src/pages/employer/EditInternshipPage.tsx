import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Briefcase, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/services/api';

interface FormData {
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string;
  salary: string;
  startDate: string;
  endDate: string;
}

interface FieldErrors {
  title?: string;
  description?: string;
  location?: string;
  duration?: string;
  requiredHours?: string;
  requiredSkills?: string;
  salary?: string;
  startDate?: string;
  endDate?: string;
}

interface Internship {
  id: string;
  title: string;
  description: string;
  location: string;
  duration: number;
  requiredHours: number;
  requiredSkills: string[];
  salary: number | null;
  startDate: string;
  endDate: string;
  company: {
    id: string;
  };
}

export default function EditInternshipPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    location: '',
    duration: 3,
    requiredHours: 160,
    requiredSkills: '',
    salary: '',
    startDate: '',
    endDate: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<keyof FormData>>(new Set());

  useEffect(() => {
    if (id) {
      loadInternship();
    }
  }, [id]);

  const loadInternship = async () => {
    try {
      setIsLoading(true);
      const internship = await apiRequest<Internship>(`/api/internships/${id}`, {
        method: 'GET',
      });

      // Pre-fill form with existing data
      setFormData({
        title: internship.title,
        description: internship.description,
        location: internship.location,
        duration: internship.duration,
        requiredHours: internship.requiredHours,
        requiredSkills: internship.requiredSkills.join(', '),
        salary: internship.salary ? String(internship.salary) : '',
        startDate: formatDateForInput(internship.startDate),
        endDate: formatDateForInput(internship.endDate),
      });
    } catch (error: any) {
      console.error('Failed to load internship:', error);
      toast.error('Failed to load internship details');
      navigate('/employer/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateForInput = (date: Date | string): string => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const errors: FieldErrors = {};
    (Object.keys(formData) as (keyof FormData)[]).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) errors[key] = error;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Please fix validation errors');
      return;
    }

    try {
      setIsSubmitting(true);

      // Transform skills string to array
      const skills = formData.requiredSkills
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload = {
        title: formData.title,
        description: formData.description,
        location: formData.location,
        duration: formData.duration,
        requiredHours: formData.requiredHours,
        requiredSkills: skills,
        salary: formData.salary ? parseFloat(formData.salary) : null,
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      await apiRequest(`/api/internships/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      toast.success('Internship updated successfully!');
      navigate('/employer/dashboard');
    } catch (error: any) {
      console.error('Failed to update internship:', error);
      const message = error?.message || 'Failed to update internship';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateField = (name: keyof FormData, value: string | number): string | undefined => {
    switch (name) {
      case 'title':
        if (!value) return 'Title is required';
        if (typeof value === 'string' && value.length > 100) return 'Maximum 100 characters';
        break;
      case 'description':
        if (!value) return 'Description is required';
        if (typeof value === 'string' && value.length < 100) return 'Minimum 100 characters required';
        if (typeof value === 'string' && value.length > 2000) return 'Maximum 2000 characters';
        break;
      case 'location':
        if (!value) return 'Location is required';
        break;
      case 'duration':
        if (!value || Number(value) <= 0) return 'Duration must be greater than 0';
        break;
      case 'requiredHours':
        if (!value || Number(value) <= 0) return 'Required hours must be greater than 0';
        break;
      case 'requiredSkills':
        if (!value || (typeof value === 'string' && !value.trim())) return 'At least one skill is required';
        break;
      case 'startDate':
        if (!value) return 'Start date is required';
        break;
      case 'endDate':
        if (!value) return 'End date is required';
        if (formData.startDate && value) {
          const start = new Date(formData.startDate);
          const end = new Date(value as string);
          if (end <= start) return 'End date must be after start date';
        }
        break;
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;
    const fieldValue = name === 'duration' || name === 'requiredHours' ? Number(value) : value;

    setFormData(prev => ({
      ...prev,
      [name]: fieldValue,
    }));

    // Clear error for this field when user starts typing
    if (touchedFields.has(fieldName)) {
      const error = validateField(fieldName, fieldValue);
      setFieldErrors(prev => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof FormData;
    const fieldValue = name === 'duration' || name === 'requiredHours' ? Number(value) : value;

    // Mark field as touched
    setTouchedFields(prev => new Set(prev).add(fieldName));

    // Validate field on blur
    const error = validateField(fieldName, fieldValue);
    setFieldErrors(prev => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/employer/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Natrag na Dashboard
      </Button>

      <div className="bg-white rounded-lg border p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Uredi Ponudu za Praksu</h1>
            <p className="text-sm text-gray-600">Ažurirajte detalje prakse</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Naziv pozicije <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="npr. Frontend Developer Intern"
              className={fieldErrors.title ? 'border-red-500' : ''}
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-500">{fieldErrors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Opis prakse <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Detaljno opišite odgovornosti, zadatke i očekivanja..."
              rows={6}
              className={fieldErrors.description ? 'border-red-500' : ''}
            />
            <div className="flex justify-between text-sm">
              <span className={fieldErrors.description ? 'text-red-500' : 'text-gray-500'}>
                {fieldErrors.description || `${formData.description.length} / 2000 znakova (minimum 100)`}
              </span>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Lokacija <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="npr. Zagreb, Hrvatska"
              className={fieldErrors.location ? 'border-red-500' : ''}
            />
            {fieldErrors.location && (
              <p className="text-sm text-red-500">{fieldErrors.location}</p>
            )}
          </div>

          {/* Duration and Required Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration">
                Trajanje (mjeseci) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.duration ? 'border-red-500' : ''}
              />
              {fieldErrors.duration && (
                <p className="text-sm text-red-500">{fieldErrors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredHours">
                Potrebni sati <span className="text-red-500">*</span>
              </Label>
              <Input
                id="requiredHours"
                name="requiredHours"
                type="number"
                min="1"
                value={formData.requiredHours}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.requiredHours ? 'border-red-500' : ''}
              />
              {fieldErrors.requiredHours && (
                <p className="text-sm text-red-500">{fieldErrors.requiredHours}</p>
              )}
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <Label htmlFor="requiredSkills">
              Potrebne vještine <span className="text-red-500">*</span>
            </Label>
            <Input
              id="requiredSkills"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="npr. React, TypeScript, CSS (odvojeno zarezom)"
              className={fieldErrors.requiredSkills ? 'border-red-500' : ''}
            />
            {fieldErrors.requiredSkills && (
              <p className="text-sm text-red-500">{fieldErrors.requiredSkills}</p>
            )}
            <p className="text-sm text-gray-500">Odvojite vještine zarezom</p>
          </div>

          {/* Salary */}
          <div className="space-y-2">
            <Label htmlFor="salary">Plaća (EUR) - Opcionalno</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              min="0"
              step="0.01"
              value={formData.salary}
              onChange={handleChange}
              placeholder="npr. 500.00"
            />
            <p className="text-sm text-gray-500">Ostavite prazno ako je neplaćena praksa</p>
          </div>

          {/* Start and End Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate">
                Datum početka <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.startDate ? 'border-red-500' : ''}
              />
              {fieldErrors.startDate && (
                <p className="text-sm text-red-500">{fieldErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">
                Datum kraja <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                className={fieldErrors.endDate ? 'border-red-500' : ''}
              />
              {fieldErrors.endDate && (
                <p className="text-sm text-red-500">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="flex-1"
            >
              Odustani
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Spremanje...
                </>
              ) : (
                'Spremi promjene'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
