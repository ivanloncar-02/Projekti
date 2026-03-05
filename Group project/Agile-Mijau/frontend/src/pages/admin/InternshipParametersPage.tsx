import { useState, useEffect } from 'react';
import { Calendar, FileText, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { parametersService } from '@/services/parametersService';
import type { ApprovalLockStatus } from '@/services/parametersService';
import type { InternshipParameters, CreateParametersDto } from '@/types/internship';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const InternshipParametersPage = () => {
  const [activeParams, setActiveParams] = useState<InternshipParameters | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalLock, setApprovalLock] = useState<ApprovalLockStatus>({ isLocked: false, reason: null });
  const [lockReason, setLockReason] = useState('');
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [formData, setFormData] = useState({
    duration: 3,
    requiredHours: 160,
    applicationDeadline: '',
    startDate: '',
  });

  useEffect(() => {
    fetchActiveParameters();
    fetchApprovalLockStatus();
  }, []);

  const fetchActiveParameters = async () => {
    setLoading(true);
    try {
      const data = await parametersService.getActive();
      setActiveParams(data);
    } catch (error) {
      console.error('Error fetching parameters:', error);
      toast.error('Greška pri učitavanju parametara');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalLockStatus = async () => {
    try {
      const status = await parametersService.getApprovalLockStatus();
      setApprovalLock(status);
      setLockReason(status.reason || '');
    } catch (error) {
      console.error('Error fetching approval lock status:', error);
    }
  };

  const handleToggleApprovalLock = async () => {
    setIsTogglingLock(true);
    try {
      const newLockState = !approvalLock.isLocked;
      await parametersService.toggleApprovalLock({
        isLocked: newLockState,
        reason: newLockState ? lockReason : undefined,
      });
      setApprovalLock({ isLocked: newLockState, reason: newLockState ? lockReason : null });
      toast.success(newLockState ? 'Odobravanje je zaključano' : 'Odobravanje je otključano');
      if (!newLockState) setLockReason('');
    } catch (error) {
      console.error('Error toggling approval lock:', error);
      toast.error('Greška pri promjeni statusa zaključavanja');
    } finally {
      setIsTogglingLock(false);
    }
  };

  // Calculate end date from start date + duration
  const calculateEndDate = (startDate: string, durationMonths: number): string => {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + durationMonths);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validacija
    if (new Date(formData.applicationDeadline) >= new Date(formData.startDate)) {
      toast.error('Rok za prijave mora biti prije datuma početka');
      return;
    }

    const endDate = calculateEndDate(formData.startDate, formData.duration);

    try {
      const createDto: CreateParametersDto = {
        duration: formData.duration,
        requiredHours: formData.requiredHours,
        applicationDeadline: formData.applicationDeadline,
        startDate: formData.startDate,
        endDate: endDate
      };

      await parametersService.create(createDto);
      toast.success('Parametri uspješno ažurirani!');

      await fetchActiveParameters();

      // Reset form
      setFormData({
        duration: 3,
        requiredHours: 160,
        applicationDeadline: '',
        startDate: '',
      });
    } catch (error) {
      console.error('Error updating parameters:', error);
      toast.error('Greška pri ažuriranju parametara');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'requiredHours' ? parseInt(value) || 0 : value
    }));
  };

  // Calculate preview end date
  const previewEndDate = formData.startDate
    ? calculateEndDate(formData.startDate, formData.duration)
    : '';

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-48 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Parametri prakse</h1>

      {/* Approval Lock Section - only show if parameters exist */}
      {activeParams && (
        <div className={`border rounded-lg p-6 mb-8 ${approvalLock.isLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {approvalLock.isLocked ? (
                <Lock className="w-6 h-6 text-red-600" />
              ) : (
                <Unlock className="w-6 h-6 text-green-600" />
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  {approvalLock.isLocked ? 'Odobravanje je zaključano' : 'Odobravanje je aktivno'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {approvalLock.isLocked
                    ? 'Studenti i mentori ne mogu vršiti promjene na prijavama.'
                    : 'Sustav je otvoren za prijave i odobrenja.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={approvalLock.isLocked}
                onCheckedChange={handleToggleApprovalLock}
                disabled={isTogglingLock}
              />
            </div>
          </div>

          {approvalLock.isLocked && approvalLock.reason && (
            <div className="mt-4 p-3 bg-red-100 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Razlog zaključavanja:</p>
                <p className="text-sm text-red-700">{approvalLock.reason}</p>
              </div>
            </div>
          )}

          {!approvalLock.isLocked && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">
                Razlog zaključavanja (opcionalno)
              </label>
              <input
                type="text"
                value={lockReason}
                onChange={(e) => setLockReason(e.target.value)}
                placeholder="npr. Održavanje sustava, Rok za prijave istekao..."
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          )}
        </div>
      )}

      {/* Active Parameters Display */}
      {activeParams && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Aktivni parametri
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Trajanje prakse</p>
              <p className="text-lg font-medium">{activeParams.duration} mjeseci</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Minimalni broj radnih sati</p>
              <p className="text-lg font-medium">{activeParams.requiredHours} sati</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Rok za prijave</p>
              <p className="text-lg font-medium">{new Date(activeParams.applicationDeadline).toLocaleDateString('hr-HR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Početak prakse</p>
              <p className="text-lg font-medium">{new Date(activeParams.startDate).toLocaleDateString('hr-HR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Završetak prakse</p>
              <p className="text-lg font-medium">{new Date(activeParams.endDate).toLocaleDateString('hr-HR')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Form */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {activeParams ? 'Ažuriraj parametre' : 'Kreiraj parametre'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Trajanje prakse <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">Koliko mjeseci traje period prakse</p>
              <div className="relative">
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  min="1"
                  max="12"
                  required
                  className="w-full px-3 py-2 pr-20 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">mjeseci</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimalni broj radnih sati <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">Koliko sati student mora odraditi tijekom prakse</p>
              <div className="relative">
                <input
                  type="number"
                  name="requiredHours"
                  value={formData.requiredHours}
                  onChange={handleChange}
                  min="40"
                  max="500"
                  required
                  className="w-full px-3 py-2 pr-12 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">sati</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Rok za prijave <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">Do kada se studenti mogu prijaviti na praksu</p>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Početak prakse <span className="text-destructive">*</span>
              </label>
              <p className="text-xs text-muted-foreground mb-2">Kada službeno počinje period prakse</p>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Preview calculated end date */}
          {previewEndDate && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Izračunati datum završetka: <span className="font-medium text-foreground">{new Date(previewEndDate).toLocaleDateString('hr-HR')}</span>
                <span className="text-xs ml-2">(početak + {formData.duration} mjeseci)</span>
              </p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormData({
                duration: 3,
                requiredHours: 160,
                applicationDeadline: '',
                startDate: '',
              })}
            >
              Poništi
            </Button>
            <Button type="submit">
              {activeParams ? 'Ažuriraj parametre' : 'Kreiraj parametre'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternshipParametersPage;
