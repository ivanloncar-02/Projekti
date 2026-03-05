import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Filter,
  Mail,
  GraduationCap,
  Building2,
  UserCog,
  Shield,
  UserX,
  UserCheck,
  MoreVertical,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'STUDENT' | 'EMPLOYER' | 'ADMIN' | 'COMPANY_MENTOR' | 'ACADEMIC_MENTOR';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  company?: {
    id: string;
    name: string;
  } | null;
  student?: {
    id: string;
    studentNumber: string;
  } | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: 'Student',
  EMPLOYER: 'Poslodavac',
  ADMIN: 'Administrator',
  COMPANY_MENTOR: 'Mentor iz tvrtke',
  ACADEMIC_MENTOR: 'Akademski mentor',
};

const ROLE_ICONS: Record<UserRole, typeof Users> = {
  STUDENT: GraduationCap,
  EMPLOYER: Building2,
  ADMIN: Shield,
  COMPANY_MENTOR: UserCog,
  ACADEMIC_MENTOR: UserCog,
};

const ROLE_COLORS: Record<UserRole, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  EMPLOYER: 'bg-green-100 text-green-700',
  ADMIN: 'bg-red-100 text-red-700',
  COMPANY_MENTOR: 'bg-orange-100 text-orange-700',
  ACADEMIC_MENTOR: 'bg-yellow-100 text-yellow-700',
};

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') as UserRole | null;
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>(initialRole || 'ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  // Dialog states
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isToggleActiveDialogOpen, setIsToggleActiveDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<UserRole | ''>('');

  const itemsPerPage = 15;
  const isAdmin = currentUser?.role === 'ADMIN';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<UserData[]>('/api/admin/users', { method: 'GET' });
      setUsers(response || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Nije moguće učitati korisnike');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: newRole }),
      });
      toast.success('Uloga uspješno promijenjena');
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
      fetchUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error instanceof Error ? error.message : 'Greška pri promjeni uloge');
    }
  };

  const handleToggleActive = async () => {
    if (!selectedUser) return;

    try {
      await apiRequest(`/api/admin/users/${selectedUser.id}/toggle-active`, {
        method: 'PATCH',
      });
      toast.success(selectedUser.isActive ? 'Korisnik deaktiviran' : 'Korisnik aktiviran');
      setIsToggleActiveDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error(error instanceof Error ? error.message : 'Greška pri promjeni statusa');
    }
  };

  const filteredUsers = users
    .filter((user) => {
      const matchesSearch =
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.student?.studentNumber?.includes(searchTerm) ||
        user.company?.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && user.isActive) ||
        (statusFilter === 'INACTIVE' && !user.isActive);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((a, b) => a.lastName.localeCompare(b.lastName));

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const openRoleDialog = (user: UserData) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const openToggleActiveDialog = (user: UserData) => {
    setSelectedUser(user);
    setIsToggleActiveDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <div className="mb-4">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Users className="h-8 w-8" />
            Upravljanje korisnicima
          </h1>
          <p className="text-muted-foreground mt-1">
            Pregledajte i upravljajte svim korisnicima sustava
          </p>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filteri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Pretraži po imenu, emailu, indeksu ili tvrtki..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={roleFilter}
                  onValueChange={(value) => {
                    setRoleFilter(value as UserRole | 'ALL');
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Uloga" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Sve uloge</SelectItem>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="EMPLOYER">Poslodavac</SelectItem>
                    <SelectItem value="COMPANY_MENTOR">Mentor iz tvrtke</SelectItem>
                    <SelectItem value="ACADEMIC_MENTOR">Akademski mentor</SelectItem>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-40">
                <Select
                  value={statusFilter}
                  onValueChange={(value) => {
                    setStatusFilter(value as 'ALL' | 'ACTIVE' | 'INACTIVE');
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Svi statusi</SelectItem>
                    <SelectItem value="ACTIVE">Aktivni</SelectItem>
                    <SelectItem value="INACTIVE">Neaktivni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Učitavanje...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nema pronađenih korisnika</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Korisnik</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Uloga</TableHead>
                    <TableHead>Detalji</TableHead>
                    <TableHead>Status</TableHead>
                    {isAdmin && <TableHead className="text-right">Akcije</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user) => {
                    const RoleIcon = ROLE_ICONS[user.role];
                    const isCurrentUser = currentUser?.id === user.id;

                    return (
                      <TableRow key={user.id} className={!user.isActive ? 'opacity-50' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center ${ROLE_COLORS[user.role]}`}
                            >
                              <RoleIcon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                                {isCurrentUser && (
                                  <span className="text-xs text-muted-foreground ml-2">(vi)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={ROLE_COLORS[user.role]}>
                            {ROLE_LABELS[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.student?.studentNumber && (
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {user.student.studentNumber}
                            </code>
                          )}
                          {user.company?.name && (
                            <span className="text-sm text-muted-foreground">
                              {user.company.name}
                            </span>
                          )}
                          {!user.student?.studentNumber && !user.company?.name && (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.isActive ? (
                            <Badge variant="default" className="bg-green-600">
                              Aktivan
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Neaktivan</Badge>
                          )}
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            {!isCurrentUser && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuLabel>Akcije</DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {user.role === 'STUDENT' && user.student?.id && (
                                    <DropdownMenuItem onClick={() => navigate(`/admin/students/${user.student!.id}`)}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Pregledaj profil
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => openRoleDialog(user)}>
                                    <UserCog className="h-4 w-4 mr-2" />
                                    Promijeni ulogu
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => openToggleActiveDialog(user)}>
                                    {user.isActive ? (
                                      <>
                                        <UserX className="h-4 w-4 mr-2" />
                                        Deaktiviraj
                                      </>
                                    ) : (
                                      <>
                                        <UserCheck className="h-4 w-4 mr-2" />
                                        Aktiviraj
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Prikazano {paginatedUsers.length} od {filteredUsers.length} korisnika
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prethodna
                    </Button>
                    <span className="px-4 py-2 text-sm">
                      Stranica {currentPage} od {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Sljedeća
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promijeni ulogu korisnika</DialogTitle>
            <DialogDescription>
              Mijenjate ulogu za korisnika: {selectedUser?.firstName} {selectedUser?.lastName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newRole} onValueChange={(value) => setNewRole(value as UserRole)}>
              <SelectTrigger>
                <SelectValue placeholder="Odaberi ulogu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STUDENT">Student</SelectItem>
                <SelectItem value="EMPLOYER">Poslodavac</SelectItem>
                <SelectItem value="COMPANY_MENTOR">Mentor iz tvrtke</SelectItem>
                <SelectItem value="ACADEMIC_MENTOR">Akademski mentor</SelectItem>
                <SelectItem value="ADMIN">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Odustani
            </Button>
            <Button onClick={handleUpdateRole} disabled={!newRole || newRole === selectedUser?.role}>
              Spremi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Toggle Active Confirmation Dialog */}
      <AlertDialog open={isToggleActiveDialogOpen} onOpenChange={setIsToggleActiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.isActive ? 'Deaktiviraj korisnika?' : 'Aktiviraj korisnika?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.isActive
                ? `Jeste li sigurni da želite deaktivirati korisnika ${selectedUser?.firstName} ${selectedUser?.lastName}? Korisnik se neće moći prijaviti u sustav.`
                : `Jeste li sigurni da želite aktivirati korisnika ${selectedUser?.firstName} ${selectedUser?.lastName}? Korisnik će se moći prijaviti u sustav.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>
              {selectedUser?.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
