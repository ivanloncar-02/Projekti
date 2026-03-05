import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/services/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  indexNumber: string;
}

interface CompanyEvaluation {
  id: string;
  isLocked: boolean;
  companyMentorName: string;
  completedAt?: string;
}

interface GradeFormData {
  finalGrade: string;
  technicalPerformance: string;
  professionalBehavior: string;
  overallAssessment: string;
  recommendations: string;
}

interface StudentGrade {
  id?: string;
  isGraded: boolean;
  gradedAt?: string;
  finalGrade?: string;
  technicalPerformance?: string;
  professionalBehavior?: string;
  overallAssessment?: string;
  recommendations?: string;
}

export default function GradeStudentPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [student, setStudent] = useState<Student | null>(null);
  const [companyEvaluation, setCompanyEvaluation] = useState<CompanyEvaluation | null>(null);
  const [studentGrade, setStudentGrade] = useState<StudentGrade>({ isGraded: false });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<GradeFormData>({
    finalGrade: '',
    technicalPerformance: '',
    professionalBehavior: '',
    overallAssessment: '',
    recommendations: '',
  });

  const [errors, setErrors] = useState<Partial<GradeFormData>>({});

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    setIsLoading(true);
    try {
      const [studentRes, evaluationRes, gradeRes] = await Promise.all([
        apiRequest<Student>(`/api/students/${studentId}`, { method: 'GET' }),
        apiRequest<CompanyEvaluation>(`/api/students/${studentId}/company-evaluation`, { method: 'GET' }).catch(() => null),
        apiRequest<StudentGrade>(`/api/students/${studentId}/grade`, { method: 'GET' }).catch((): StudentGrade => ({ isGraded: false })),
      ]);

      setStudent(studentRes);
      setCompanyEvaluation(evaluationRes);
      setStudentGrade(gradeRes || { isGraded: false });

      // If already graded, pre-fill form with existing data
      if (gradeRes?.isGraded) {
        setFormData({
          finalGrade: gradeRes.finalGrade || '',
          technicalPerformance: gradeRes.technicalPerformance || '',
          professionalBehavior: gradeRes.professionalBehavior || '',
          overallAssessment: gradeRes.overallAssessment || '',
          recommendations: gradeRes.recommendations || '',
        });
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
      toast.error('Failed to load student data');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<GradeFormData> = {};

    if (!formData.finalGrade) {
      newErrors.finalGrade = 'Final grade is required';
    }

    if (!formData.technicalPerformance) {
      newErrors.technicalPerformance = 'Technical performance rating is required';
    }

    if (!formData.professionalBehavior) {
      newErrors.professionalBehavior = 'Professional behavior rating is required';
    }

    if (!formData.overallAssessment) {
      newErrors.overallAssessment = 'Overall assessment is required';
    } else if (formData.overallAssessment.length < 100) {
      newErrors.overallAssessment = 'Overall assessment must be at least 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiRequest(`/api/students/${studentId}/grade`, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      toast.success('Student graded successfully. Notification sent to student.');

      // Update local state to show graded status
      setStudentGrade({
        ...studentGrade,
        isGraded: true,
        gradedAt: new Date().toISOString(),
        ...formData,
      });

      // Optionally navigate back after a delay
      setTimeout(() => {
        navigate('/mentor/academic/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting grade:', error);
      toast.error('Failed to submit grade. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Prerequisite check: Company evaluation must be locked
  if (!companyEvaluation?.isLocked) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cannot Grade Student</AlertTitle>
          <AlertDescription>
            The company evaluation must be completed and locked before you can grade this student.
            Please wait for the company mentor to complete their evaluation.
          </AlertDescription>
        </Alert>

        {companyEvaluation && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Company Evaluation Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Company Mentor: {companyEvaluation.companyMentorName}
              </p>
              <Badge variant="outline" className="mt-2">
                Evaluation In Progress
              </Badge>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Grade Student</h1>
            {student && (
              <p className="text-muted-foreground mt-2">
                {student.firstName} {student.lastName} ({student.indexNumber})
              </p>
            )}
          </div>
          {studentGrade.isGraded && (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-3 w-3 mr-1" />
              GRADED
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Academic Evaluation Form</CardTitle>
              <CardDescription>
                Complete the academic evaluation for this student's internship performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Final Grade */}
                <div className="space-y-2">
                  <Label htmlFor="finalGrade">
                    Final Grade *
                  </Label>
                  <Select
                    value={formData.finalGrade}
                    onValueChange={(value) =>
                      setFormData({ ...formData, finalGrade: value })
                    }
                    disabled={studentGrade.isGraded}
                  >
                    <SelectTrigger
                      id="finalGrade"
                      className={errors.finalGrade ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Select final grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 (Excellent)</SelectItem>
                      <SelectItem value="4">4 (Very Good)</SelectItem>
                      <SelectItem value="3">3 (Good)</SelectItem>
                      <SelectItem value="2">2 (Sufficient)</SelectItem>
                      <SelectItem value="1">1 (Insufficient)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.finalGrade && (
                    <p className="text-sm text-red-500">{errors.finalGrade}</p>
                  )}
                </div>

                {/* Technical Performance */}
                <div className="space-y-2">
                  <Label htmlFor="technicalPerformance">
                    Technical Performance *
                  </Label>
                  <Select
                    value={formData.technicalPerformance}
                    onValueChange={(value) =>
                      setFormData({ ...formData, technicalPerformance: value })
                    }
                    disabled={studentGrade.isGraded}
                  >
                    <SelectTrigger
                      id="technicalPerformance"
                      className={errors.technicalPerformance ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Rate technical performance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 (Outstanding)</SelectItem>
                      <SelectItem value="4">4 (Above Average)</SelectItem>
                      <SelectItem value="3">3 (Average)</SelectItem>
                      <SelectItem value="2">2 (Below Average)</SelectItem>
                      <SelectItem value="1">1 (Poor)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.technicalPerformance && (
                    <p className="text-sm text-red-500">{errors.technicalPerformance}</p>
                  )}
                </div>

                {/* Professional Behavior */}
                <div className="space-y-2">
                  <Label htmlFor="professionalBehavior">
                    Professional Behavior *
                  </Label>
                  <Select
                    value={formData.professionalBehavior}
                    onValueChange={(value) =>
                      setFormData({ ...formData, professionalBehavior: value })
                    }
                    disabled={studentGrade.isGraded}
                  >
                    <SelectTrigger
                      id="professionalBehavior"
                      className={errors.professionalBehavior ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder="Rate professional behavior" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 (Exemplary)</SelectItem>
                      <SelectItem value="4">4 (Professional)</SelectItem>
                      <SelectItem value="3">3 (Satisfactory)</SelectItem>
                      <SelectItem value="2">2 (Needs Improvement)</SelectItem>
                      <SelectItem value="1">1 (Unprofessional)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.professionalBehavior && (
                    <p className="text-sm text-red-500">{errors.professionalBehavior}</p>
                  )}
                </div>

                {/* Overall Assessment */}
                <div className="space-y-2">
                  <Label htmlFor="overallAssessment">
                    Overall Assessment * (min. 100 characters)
                  </Label>
                  <Textarea
                    id="overallAssessment"
                    value={formData.overallAssessment}
                    onChange={(e) =>
                      setFormData({ ...formData, overallAssessment: e.target.value })
                    }
                    disabled={studentGrade.isGraded}
                    placeholder="Provide a comprehensive assessment of the student's overall performance during the internship..."
                    rows={6}
                    minLength={100}
                    maxLength={2000}
                    className={errors.overallAssessment ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {formData.overallAssessment.length} / 2000 characters
                      {formData.overallAssessment.length < 100 && (
                        <span className="text-red-500 ml-2">
                          (minimum 100 required)
                        </span>
                      )}
                    </p>
                  </div>
                  {errors.overallAssessment && (
                    <p className="text-sm text-red-500">{errors.overallAssessment}</p>
                  )}
                </div>

                {/* Recommendations */}
                <div className="space-y-2">
                  <Label htmlFor="recommendations">
                    Recommendations (optional)
                  </Label>
                  <Textarea
                    id="recommendations"
                    value={formData.recommendations}
                    onChange={(e) =>
                      setFormData({ ...formData, recommendations: e.target.value })
                    }
                    disabled={studentGrade.isGraded}
                    placeholder="Provide any additional recommendations or comments..."
                    rows={4}
                    maxLength={1000}
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.recommendations.length} / 1000 characters
                  </p>
                </div>

                {!studentGrade.isGraded && (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                    size="lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Grade'}
                  </Button>
                )}

                {studentGrade.isGraded && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Grade Submitted</AlertTitle>
                    <AlertDescription className="text-green-700">
                      This student has been graded on{' '}
                      {studentGrade.gradedAt &&
                        new Date(studentGrade.gradedAt).toLocaleDateString()}
                      . The form is now locked and the student has been notified.
                    </AlertDescription>
                  </Alert>
                )}
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student && (
                <>
                  <div>
                    <Label className="text-xs text-muted-foreground">Name</Label>
                    <p className="font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Index Number</Label>
                    <p className="font-medium">{student.indexNumber}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium text-sm">{student.email}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Company Evaluation</CardTitle>
            </CardHeader>
            <CardContent>
              {companyEvaluation && (
                <div className="space-y-2">
                  <p className="text-sm text-blue-900">
                    <strong>Company Mentor:</strong> {companyEvaluation.companyMentorName}
                  </p>
                  <p className="text-sm text-blue-900">
                    <strong>Completed:</strong>{' '}
                    {companyEvaluation.completedAt &&
                      new Date(companyEvaluation.completedAt).toLocaleDateString()}
                  </p>
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
