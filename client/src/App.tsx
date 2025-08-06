
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Users, FileText, CreditCard, Calendar, User } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { StudentDashboard } from '@/components/StudentDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { ProgramCatalog } from '@/components/ProgramCatalog';
import { RegistrationForm } from '@/components/RegistrationForm';
import type { TrainingProgram } from '../../server/src/schema';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'catalog' | 'register' | 'student' | 'admin'>('landing');
  const [selectedProgram, setSelectedProgram] = useState<TrainingProgram | null>(null);
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: number; name: string; role: 'student' | 'admin' } | null>(null);

  // Default user for demo - in real app this would come from authentication
  useEffect(() => {
    const defaultUser = { id: 1, name: 'John Doe', role: 'student' as const };
    setCurrentUser(defaultUser);
  }, []);

  const loadPrograms = useCallback(async () => {
    try {
      const result = await trpc.getTrainingPrograms.query();
      setPrograms(result);
    } catch (error) {
      console.error('Failed to load programs:', error);
    }
  }, []);

  useEffect(() => {
    loadPrograms();
  }, [loadPrograms]);

  const handleProgramSelect = (program: TrainingProgram) => {
    setSelectedProgram(program);
    setCurrentView('register');
  };

  const handleRegistrationSuccess = () => {
    setCurrentView('student');
    setSelectedProgram(null);
  };

  if (currentView === 'catalog') {
    return (
      <ProgramCatalog
        programs={programs}
        onProgramSelect={handleProgramSelect}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'register' && selectedProgram) {
    return (
      <RegistrationForm
        program={selectedProgram}
        userId={currentUser?.id || 1}
        onSuccess={handleRegistrationSuccess}
        onBack={() => setCurrentView('catalog')}
      />
    );
  }

  if (currentView === 'student') {
    return (
      <StudentDashboard
        userId={currentUser?.id || 1}
        userName={currentUser?.name || 'Student'}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (currentView === 'admin') {
    return (
      <AdminDashboard
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  // Landing page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <GraduationCap className="h-12 w-12 text-indigo-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">EduTrain Center</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Platform pendaftaran online untuk program pelatihan dan pendidikan berkualitas tinggi 📚
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-blue-600">500+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Peserta Aktif</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <GraduationCap className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-green-600">25+</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Program Pelatihan</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <FileText className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-purple-600">98%</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Tingkat Kelulusan</p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <Calendar className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <CardTitle className="text-2xl font-bold text-orange-600">24/7</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Akses Platform</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-6 w-6 text-indigo-600 mr-2" />
                Lihat Program Pelatihan
              </CardTitle>
              <CardDescription>
                Jelajahi berbagai program pelatihan yang tersedia 🔍
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCurrentView('catalog')} 
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Jelajahi Program
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-6 w-6 text-blue-600 mr-2" />
                Dashboard Peserta
              </CardTitle>
              <CardDescription>
                Kelola pendaftaran dan lihat status pembelajaran Anda 👨‍🎓
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCurrentView('student')} 
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Masuk Dashboard
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 text-green-600 mr-2" />
                Dashboard Admin
              </CardTitle>
              <CardDescription>
                Kelola program, pendaftaran, dan verifikasi dokumen 👨‍💼
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setCurrentView('admin')} 
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Admin Panel
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Mengapa Memilih EduTrain Center? ⭐</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold mb-2">Pembayaran Fleksibel</h3>
                <p className="text-sm text-gray-600">Multiple metode pembayaran tersedia</p>
              </div>

              <div className="text-center">
                <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Verifikasi Cepat</h3>
                <p className="text-sm text-gray-600">Proses verifikasi dokumen yang efisien</p>
              </div>

              <div className="text-center">
                <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Jadwal Fleksibel</h3>
                <p className="text-sm text-gray-600">Pilihan waktu yang sesuai kebutuhan</p>
              </div>

              <div className="text-center">
                <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Mentor Berpengalaman</h3>
                <p className="text-sm text-gray-600">Dibimbing oleh praktisi profesional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p>© 2024 EduTrain Center. Platform pendidikan terpercaya untuk masa depan yang lebih baik. 🚀</p>
        </div>
      </div>
    </div>
  );
}

export default App;
