import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserCheck, GraduationCap, Mail, Hash } from 'lucide-react';
import { UserRole } from '@/types';
import { apiRequest } from '@/services/api';

interface StudentMentorInfo {
  id: string;
  firstName: string;
  lastName: string;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  indexNumber: string;
  academicMentor: StudentMentorInfo | null;
  companyMentor: StudentMentorInfo | null;
}

interface Mentor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  companyName?: string;
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [selectedAcademicMentorId, setSelectedAcademicMentorId] = useState<string>('');
  const [selectedCompanyMentorId, setSelectedCompanyMentorId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const academicMentors = mentors.filter(m => m.role === UserRole.ACADEMIC_MENTOR);
  const companyMentors = mentors.filter(m => m.role === UserRole.COMPANY_MENTOR);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsRes, mentorsRes] = await Promise.all([
        apiRequest<Student[]>('/api/students', { method: 'GET' }),
        apiRequest<Mentor[]>('/api/mentors', { method: 'GET' }),
      ]);

      const foundStudent = studentsRes.find(s => s.id === id);
      if (foundStudent) {
        setStudent(foundStudent);
      } else {
        toast.error('Student nije pronađen');
        navigate('/admin/users');
      }
      setMentors(mentorsRes);
    } catch (error) {
      console.error('Greška pri dohvaćanju podataka:', error);
      toast.error('Nije moguće učitati podatke');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!student) return;

    if (!selectedAcademicMentorId && !selectedCompanyMentorId) {
      toast.error('Molimo odaberite barem jednog mentora');
      return;
    }

    setIsSubmitting(true);
    const assignedMentors: string[] = [];

    try {
      if (selectedAcademicMentorId) {
        await apiRequest('/api/admin/assign-mentor', {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            mentorId: selectedAcademicMentorId,
            mentorType: 'ACADEMIC_MENTOR'
          }),
        });
        const mentor = academicMentors.find(m => m.id === selectedAcademicMentorId);
        assignedMentors.push(`akademski mentor ${mentor?.firstName} ${mentor?.lastName}`);
      }

      if (selectedCompanyMentorId) {
        await apiRequest('/api/admin/assign-mentor', {
          method: 'POST',
          body: JSON.stringify({
            studentId: student.id,
            mentorId: selectedCompanyMentorId,
            mentorType: 'COMPANY_MENTOR'
          }),
        });
        const mentor = companyMentors.find(m => m.id === selectedCompanyMentorId);
        assignedMentors.push(`mentor iz tvrtke ${mentor?.firstName} ${mentor?.lastName}`);
      }

      toast.success(`Uspješno dodijeljeni: ${assignedMentors.join(', ')}`);

      // Refresh student data
      const updatedStudents = await apiRequest<Student[]>('/api/students', { method: 'GET' });
      const updatedStudent = updatedStudents.find(s => s.id === id);
      if (updatedStudent) {
        setStudent(updatedStudent);
      }
      setSelectedAcademicMentorId('');
      setSelectedCompanyMentorId('');
    } catch (error) {
      console.error('Greška pri dodjeli mentora:', error);
      toast.error('Nije moguće dodijeliti mentora');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAcademicMentor = academicMentors.find(m => m.id === selectedAcademicMentorId);
  const selectedCompanyMentor = companyMentors.find(m => m.id === selectedCompanyMentorId);
  const hasChanges = selectedAcademicMentorId || selectedCompanyMentorId;

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Učitavanje...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-muted-foreground">Student nije pronađen</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/users')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na popis
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-2xl">
                    {student.firstName} {student.lastName}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="h-4 w-4" />
                      {student.indexNumber}
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Mentor Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Dodjela mentora</CardTitle>
              <CardDescription>
                Odaberite akademskog mentora i/ili mentora iz tvrtke za ovog studenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Mentor */}
              <div className="space-y-2">
                <Label htmlFor="academicMentor">Akademski mentor</Label>
                <Select
                  value={selectedAcademicMentorId}
                  onValueChange={setSelectedAcademicMentorId}
                >
                  <SelectTrigger id="academicMentor">
                    <SelectValue placeholder="Odaberite akademskog mentora" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.firstName} {mentor.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {academicMentors.length} akademskih mentora dostupno
                </p>
              </div>

              {/* Company Mentor */}
              <div className="space-y-2">
                <Label htmlFor="companyMentor">Mentor iz tvrtke</Label>
                <Select
                  value={selectedCompanyMentorId}
                  onValueChange={setSelectedCompanyMentorId}
                >
                  <SelectTrigger id="companyMentor">
                    <SelectValue placeholder="Odaberite mentora iz tvrtke" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyMentors.map((mentor) => (
                      <SelectItem key={mentor.id} value={mentor.id}>
                        {mentor.firstName} {mentor.lastName}{mentor.companyName ? ` | ${mentor.companyName}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  {companyMentors.length} mentora iz tvrtki dostupno
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSubmitting || !hasChanges}
                className="w-full"
                size="lg"
              >
                <UserCheck className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Spremam...' : 'Spremi dodjelu mentora'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Current Mentors */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trenutni mentori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Akademski mentor</Label>
                <p className="font-medium">
                  {student.academicMentor ? (
                    <span className="text-green-600">
                      {student.academicMentor.firstName} {student.academicMentor.lastName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Nije dodijeljen</span>
                  )}
                </p>
                {selectedAcademicMentor && (
                  <p className="text-sm text-primary mt-1">
                    → {selectedAcademicMentor.firstName} {selectedAcademicMentor.lastName}
                  </p>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Mentor iz tvrtke</Label>
                <p className="font-medium">
                  {student.companyMentor ? (
                    <>
                      <span className="text-green-600">
                        {student.companyMentor.firstName} {student.companyMentor.lastName}
                      </span>
                      {(() => {
                        const mentor = companyMentors.find(m => m.id === student.companyMentor?.id);
                        return mentor?.companyName ? (
                          <span className="text-muted-foreground"> | {mentor.companyName}</span>
                        ) : null;
                      })()}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Nije dodijeljen</span>
                  )}
                </p>
                {selectedCompanyMentor && (
                  <p className="text-sm text-primary mt-1">
                    → {selectedCompanyMentor.firstName} {selectedCompanyMentor.lastName}
                    {selectedCompanyMentor.companyName && (
                      <span className="text-muted-foreground"> | {selectedCompanyMentor.companyName}</span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <p className="text-sm text-blue-900">
                <strong>Napomena:</strong> Akademski mentor pregledava i odobrava dnevnik prakse.
                Mentor iz tvrtke vodi studenta kroz praktični rad.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
