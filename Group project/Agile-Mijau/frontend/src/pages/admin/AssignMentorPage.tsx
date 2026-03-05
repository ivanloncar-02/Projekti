import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserCheck } from 'lucide-react';
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

export default function AssignMentorPage() {
  const { id: studentIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedStudentId, setSelectedStudentId] = useState<string>(studentIdFromUrl || '');
  const [selectedAcademicMentorId, setSelectedAcademicMentorId] = useState<string>('');
  const [selectedCompanyMentorId, setSelectedCompanyMentorId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const academicMentors = mentors.filter(m => m.role === UserRole.ACADEMIC_MENTOR);
  const companyMentors = mentors.filter(m => m.role === UserRole.COMPANY_MENTOR);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [studentsRes, mentorsRes] = await Promise.all([
          apiRequest<Student[]>('/api/students', { method: 'GET' }),
          apiRequest<Mentor[]>('/api/mentors', { method: 'GET' }),
        ]);
        setStudents(studentsRes);
        setMentors(mentorsRes);
      } catch (error) {
        console.error('Greška pri dohvaćanju podataka:', error);
        toast.error('Nije moguće učitati studente i mentore');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!selectedStudentId) {
      toast.error('Molimo odaberite studenta');
      return;
    }

    if (!selectedAcademicMentorId && !selectedCompanyMentorId) {
      toast.error('Molimo odaberite barem jednog mentora');
      return;
    }

    setIsSubmitting(true);
    const assignedMentors: string[] = [];

    try {
      // Assign academic mentor if selected
      if (selectedAcademicMentorId) {
        await apiRequest('/api/admin/assign-mentor', {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudentId,
            mentorId: selectedAcademicMentorId,
            mentorType: 'ACADEMIC_MENTOR'
          }),
        });
        const mentor = academicMentors.find(m => m.id === selectedAcademicMentorId);
        assignedMentors.push(`akademski mentor ${mentor?.firstName} ${mentor?.lastName}`);
      }

      // Assign company mentor if selected
      if (selectedCompanyMentorId) {
        await apiRequest('/api/admin/assign-mentor', {
          method: 'POST',
          body: JSON.stringify({
            studentId: selectedStudentId,
            mentorId: selectedCompanyMentorId,
            mentorType: 'COMPANY_MENTOR'
          }),
        });
        const mentor = companyMentors.find(m => m.id === selectedCompanyMentorId);
        assignedMentors.push(`mentor iz tvrtke ${mentor?.firstName} ${mentor?.lastName}`);
      }

      toast.success(`Uspješno dodijeljeni: ${assignedMentors.join(', ')}`);

      // Refresh students
      const updatedStudents = await apiRequest<Student[]>('/api/students', { method: 'GET' });
      setStudents(updatedStudents);
      setSelectedAcademicMentorId('');
      setSelectedCompanyMentorId('');

      if (studentIdFromUrl) {
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 1500);
      }
    } catch (error) {
      console.error('Greška pri dodjeli mentora:', error);
      toast.error('Nije moguće dodijeliti mentora');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag
        </Button>
        <h1 className="text-3xl font-bold">Dodijeli mentora studentu</h1>
        <p className="text-muted-foreground mt-2">
          Dodijelite akademskog mentora ili mentora iz tvrtke studentu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Student Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Odabir studenta</CardTitle>
              <CardDescription>
                Odaberite studenta kojemu želite dodijeliti mentora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  disabled={!!studentIdFromUrl}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Odaberite studenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.indexNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {studentIdFromUrl && (
                  <p className="text-sm text-muted-foreground">
                    Student je prethodno odabran
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mentors Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Odabir mentora</CardTitle>
              <CardDescription>
                Odaberite akademskog mentora i/ili mentora iz tvrtke
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Academic Mentor */}
              <div className="space-y-2">
                <Label htmlFor="academicMentor">Akademski mentor</Label>
                <Select
                  value={selectedAcademicMentorId}
                  onValueChange={setSelectedAcademicMentorId}
                  disabled={!selectedStudentId}
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
                  disabled={!selectedStudentId}
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
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !selectedStudentId || !hasChanges}
            className="w-full"
            size="lg"
          >
            <UserCheck className="h-5 w-5 mr-2" />
            {isSubmitting ? 'Spremam...' : 'Spremi dodjelu mentora'}
          </Button>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trenutno stanje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Student</Label>
                <p className="font-medium">
                  {selectedStudent ? (
                    <>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                      <br />
                      <span className="text-sm text-muted-foreground">
                        {selectedStudent.indexNumber}
                      </span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Nije odabran</span>
                  )}
                </p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Akademski mentor</Label>
                <p className="font-medium">
                  {selectedStudent?.academicMentor ? (
                    <span className="text-green-600">
                      {selectedStudent.academicMentor.firstName} {selectedStudent.academicMentor.lastName}
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
                  {selectedStudent?.companyMentor ? (
                    <>
                      <span className="text-green-600">
                        {selectedStudent.companyMentor.firstName} {selectedStudent.companyMentor.lastName}
                      </span>
                      {(() => {
                        const mentor = companyMentors.find(m => m.id === selectedStudent.companyMentor?.id);
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
