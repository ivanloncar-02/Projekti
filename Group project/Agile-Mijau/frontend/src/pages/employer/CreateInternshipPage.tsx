import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiRequest } from '@/services/api';
import { Briefcase, Info, AlertTriangle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { parametersService } from '@/services/parametersService';
import { cn } from '@/lib/utils';

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
  startDate?: string;
  endDate?: string;
}

export default function CreateInternshipPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [parametersNotConfigured, setParametersNotConfigured] = useState(false);
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
    loadParameters();
  }, []);

  const loadParameters = async () => {
    try {
      setIsLoading(true);
      const activeParams = await parametersService.getActive();

      // Check if parameters exist (API returns null if not configured)
      if (!activeParams) {
        setParametersNotConfigured(true);
        return;
      }

      // Parameters exist, pre-fill form with parameter values
      setParametersNotConfigured(false);
      setFormData(prev => ({
        ...prev,
        duration: activeParams.duration,
        requiredHours: activeParams.requiredHours,
        startDate: formatDateForInput(activeParams.startDate),
        endDate: formatDateForInput(activeParams.endDate),
      }));
    } catch (error: any) {
      console.error('Failed to load parameters:', error);

      // Check if it's a 404 or similar error indicating missing parameters
      if (error?.response?.status === 404 || error?.message?.includes('404')) {
        setParametersNotConfigured(true);
      } else {
        // Other errors - still use fallback but don't block the form
        toast.warning('Nije moguće učitati parametre sustava. Koriste se zadane vrijednosti.');
      }
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

    // Validate end date is after start date
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        toast.error('Datum završetka mora biti nakon datuma početka');
        return;
      }
    }

    // Validate duration is positive
    if (formData.duration <= 0) {
      toast.error('Trajanje mora biti veće od 0');
      return;
    }

    // Validate required skills are provided
    if (!formData.requiredSkills.trim()) {
      toast.error('Molimo navedite barem jednu potrebnu vještinu');
      return;
    }

    try {
      setIsSubmitting(true);
      // Transform requiredSkills from comma-separated string to array
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills
          .split(',')
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0),
        salary: formData.salary ? Number(formData.salary) : undefined,
      };
      await apiRequest('/api/internships', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      toast.success('Ponuda za praksu uspješno kreirana!');
      navigate('/employer/dashboard');
    } catch (error) {
      console.error('Failed to create internship:', error);
      toast.error('Neuspjelo kreiranje ponude za praksu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateField = (name: keyof FormData, value: string | number): string | undefined => {
    switch (name) {
      case 'title':
        if (!value) return 'Naziv pozicije je obavezan';
        if (typeof value === 'string' && value.length < 5) return 'Minimalno 5 znakova';
        if (typeof value === 'string' && value.length > 100) return 'Maksimalno 100 znakova';
        break;
      case 'description':
        if (!value) return 'Opis je obavezan';
        if (typeof value === 'string' && value.length < 100) return 'Minimalno 100 znakova';
        if (typeof value === 'string' && value.length > 2000) return 'Maksimalno 2000 znakova';
        break;
      case 'location':
        if (!value) return 'Lokacija je obavezna';
        break;
      case 'duration':
        if (!value || Number(value) <= 0) return 'Trajanje mora biti veće od 0';
        break;
      case 'requiredHours':
        if (!value || Number(value) <= 0) return 'Potrebni sati moraju biti veći od 0';
        break;
      case 'requiredSkills':
        if (!value || (typeof value === 'string' && !value.trim())) return 'Potrebna je barem jedna vještina';
        break;
      case 'startDate':
        if (!value) return 'Datum početka je obavezan';
        break;
      case 'endDate':
        if (!value) return 'Datum završetka je obavezan';
        if (formData.startDate && value) {
          const start = new Date(formData.startDate);
          const end = new Date(value as string);
          if (end <= start) return 'Datum završetka mora biti nakon datuma početka';
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

  const getCompletedFieldsCount = (): { completed: number; total: number } => {
    const requiredFields: (keyof FormData)[] = [
      'title',
      'description',
      'location',
      'duration',
      'requiredHours',
      'requiredSkills',
      'startDate',
      'endDate',
    ];

    const completed = requiredFields.filter(field => {
      const value = formData[field];
      if (field === 'description') {
        return typeof value === 'string' && value.length >= 100;
      }
      if (field === 'duration' || field === 'requiredHours') {
        return typeof value === 'number' && value > 0;
      }
      return typeof value === 'string' && value.trim() !== '';
    }).length;

    return { completed, total: requiredFields.length };
  };

  const isFormValid = (): boolean => {
    const { completed, total } = getCompletedFieldsCount();
    if (completed !== total) return false;

    // Check date validation
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) return false;
    }

    return true;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Učitavanje obrasca...</p>
        </div>
      </div>
    );
  }

  const fieldCompletion = getCompletedFieldsCount();

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Briefcase className="h-8 w-8" />
            Kreiraj ponudu za praksu
          </h1>
          <p className="text-muted-foreground mt-1">Ispunite detalje za vašu ponudu prakse</p>
        </div>

        <div className="mb-4 p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">
            {fieldCompletion.completed} od {fieldCompletion.total} obaveznih polja ispunjeno
          </p>
        </div>

        {/* Alert when parameters not configured */}
        {parametersNotConfigured && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Parametri sustava nisu konfigurirani</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Parametri sustava za prakse još nisu konfigurirani. Molimo kontaktirajte
                administratora kako bi postavio potrebne parametre prije kreiranja ponuda za prakse.
              </p>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Kontaktiraj administratora
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Kontaktiraj administratora</DialogTitle>
                    <DialogDescription>
                      Obratite se administratoru sustava za konfiguraciju parametara prakse.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Email administratora</Label>
                      <p className="text-sm text-muted-foreground">admin@agile-mijau.hr</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Predložak poruke</Label>
                      <Textarea
                        readOnly
                        value="Poštovani,&#10;&#10;Želio/la bih kreirati ponudu za praksu, ali parametri sustava još nisu konfigurirani. Možete li postaviti potrebne parametre (trajanje, potrebni sati, datumi početka/završetka)?&#10;&#10;Hvala!"
                        className="min-h-[150px]"
                      />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        window.location.href = 'mailto:admin@agile-mijau.hr?subject=Zahtjev za konfiguraciju parametara sustava&body=Poštovani,%0D%0A%0D%0AŽelio/la bih kreirati ponudu za praksu, ali parametri sustava još nisu konfigurirani. Možete li postaviti potrebne parametre (trajanje, potrebni sati, datumi početka/završetka)?%0D%0A%0D%0AHvala!';
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Pošalji email
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Naziv pozicije *</Label>
            <Input
              id="title"
              name="title"
              placeholder="npr. Praktikant za razvoj softvera"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={5}
              maxLength={100}
              className={cn(fieldErrors.title && 'border-red-500 focus-visible:ring-red-500')}
            />
            {fieldErrors.title && (
              <p className="text-sm text-red-500">{fieldErrors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Opišite ulogu prakse, odgovornosti i što će praktikant naučiti..."
              className={cn("min-h-[150px]", fieldErrors.description && 'border-red-500 focus-visible:ring-red-500')}
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={100}
              maxLength={2000}
            />
            <p className="text-sm text-muted-foreground">
              {formData.description.length} / 2000 znakova (minimalno 100)
            </p>
            {fieldErrors.description && (
              <p className="text-sm text-red-500">{fieldErrors.description}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Lokacija *</Label>
            <Input
              id="location"
              name="location"
              placeholder="npr. Zagreb, Hrvatska"
              value={formData.location}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={cn(fieldErrors.location && 'border-red-500 focus-visible:ring-red-500')}
            />
            {fieldErrors.location && (
              <p className="text-sm text-red-500">{fieldErrors.location}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-2">
                Trajanje (mjeseci) *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zadane vrijednosti iz postavki sustava</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="duration"
                name="duration"
                type="number"
                min="1"
                value={formData.duration}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={cn(fieldErrors.duration && 'border-red-500 focus-visible:ring-red-500')}
              />
              {fieldErrors.duration && (
                <p className="text-sm text-red-500">{fieldErrors.duration}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="requiredHours" className="flex items-center gap-2">
                Potrebni sati *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zadane vrijednosti iz postavki sustava</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="requiredHours"
                name="requiredHours"
                type="number"
                min="1"
                value={formData.requiredHours}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={cn(fieldErrors.requiredHours && 'border-red-500 focus-visible:ring-red-500')}
              />
              {fieldErrors.requiredHours && (
                <p className="text-sm text-red-500">{fieldErrors.requiredHours}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requiredSkills">Potrebne vještine *</Label>
            <Input
              id="requiredSkills"
              name="requiredSkills"
              placeholder="npr. JavaScript, React, Node.js (odvojeno zarezima)"
              value={formData.requiredSkills}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              className={cn(fieldErrors.requiredSkills && 'border-red-500 focus-visible:ring-red-500')}
            />
            <p className="text-sm text-muted-foreground">
              Navedite potrebne vještine odvojene zarezima
            </p>
            {fieldErrors.requiredSkills && (
              <p className="text-sm text-red-500">{fieldErrors.requiredSkills}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Plaća (EUR)</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              min="0"
              placeholder="Opcionalno"
              value={formData.salary}
              onChange={handleChange}
            />
            <p className="text-sm text-muted-foreground">Mjesečna plaća u EUR (opcionalno)</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="flex items-center gap-2">
                Datum početka *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zadane vrijednosti iz postavki sustava</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={cn(fieldErrors.startDate && 'border-red-500 focus-visible:ring-red-500')}
              />
              {fieldErrors.startDate && (
                <p className="text-sm text-red-500">{fieldErrors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="flex items-center gap-2">
                Datum završetka *
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zadane vrijednosti iz postavki sustava</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={cn(fieldErrors.endDate && 'border-red-500 focus-visible:ring-red-500')}
              />
              {fieldErrors.endDate && (
                <p className="text-sm text-red-500">{fieldErrors.endDate}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting || !isFormValid() || parametersNotConfigured}>
                {isSubmitting ? 'Kreiranje...' : 'Kreiraj praksu'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/employer/dashboard')}>
                Odustani
              </Button>
            </div>
            {parametersNotConfigured && (
              <p className="text-sm text-muted-foreground">
                Slanje obrasca je onemogućeno dok se ne konfiguriraju parametri sustava.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
