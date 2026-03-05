import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Building2, Mail, Phone, MapPin, Globe, User, Archive, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RoleGate } from '@/components/auth/RoleGate';
import { companyService } from '@/services/companyService';
import type { Company } from '@/types';
import { CompanyStatus } from '@/types';

export default function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const data = await companyService.getById(id);
      setCompany(data);
    } catch (error) {
      console.error('Failed to load company:', error);
      toast.error('Greška pri učitavanju podataka o tvrtki');
    } finally {
      setIsLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!id) return;

    try {
      setIsArchiving(true);
      const updatedCompany = await companyService.archive(id);
      setCompany(updatedCompany);
      toast.success(
        updatedCompany.status === CompanyStatus.ARCHIVED
          ? 'Tvrtka uspješno arhivirana'
          : 'Tvrtka uspješno vraćena iz arhive'
      );
    } catch (error) {
      console.error('Failed to archive company:', error);
      toast.error('Greška pri arhiviranju tvrtke');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleEdit = () => {
    navigate(`/admin/companies/${id}/edit`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Učitavanje podataka o tvrtki...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Tvrtka nije pronađena</p>
        </div>
      </div>
    );
  }

  const isArchived = company.status === CompanyStatus.ARCHIVED;

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building2 className="h-8 w-8" />
              {company.name}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isArchived && (
              <Badge variant="destructive" className="text-sm">
                ARHIVIRANA
              </Badge>
            )}
          </div>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Podaci o tvrtki</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">OIB</p>
                  <p className="text-base">{company.oib}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-base">{company.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adresa</p>
                  <p className="text-base">{company.address}</p>
                </div>
              </div>

              {company.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Telefon</p>
                    <p className="text-base">{company.phone}</p>
                  </div>
                </div>
              )}

              {company.website && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Web stranica</p>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                </div>
              )}

              {company.contactPerson && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kontakt osoba</p>
                    <p className="text-base">{company.contactPerson}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <RoleGate allowedRoles={['ADMIN']}>
            <Button onClick={handleEdit} className="flex items-center gap-2">
              <Edit className="h-4 w-4" />
              Uredi tvrtku
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={isArchived ? 'outline' : 'destructive'}
                  className="flex items-center gap-2"
                  disabled={isArchiving}
                >
                  <Archive className="h-4 w-4" />
                  {isArchived ? 'Vrati iz arhive' : 'Arhiviraj'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isArchived ? 'Vratiti tvrtku iz arhive?' : 'Arhivirati tvrtku?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isArchived
                      ? 'Ova akcija će vratiti tvrtku i omogućiti joj kreiranje novih ponuda za praksu.'
                      : 'Jeste li sigurni? Arhivirane tvrtke ne mogu kreirati nove ponude.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>
                    {isArchived ? 'Vrati' : 'Arhiviraj'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </RoleGate>

          <Button variant="outline" onClick={() => navigate('/admin/companies')}>
            Natrag na popis
          </Button>
        </div>
      </div>
    </div>
  );
}
