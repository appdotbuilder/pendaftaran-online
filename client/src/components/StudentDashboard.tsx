
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, FileText, CreditCard, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Registration } from '../../../server/src/schema';

interface StudentDashboardProps {
  userId: number;
  userName: string;
  onBack: () => void;
}

export function StudentDashboard({ userId, userName, onBack }: StudentDashboardProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadRegistrations = useCallback(async () => {
    try {
      const result = await trpc.getUserRegistrations.query({ user_id: userId });
      setRegistrations(result);
    } catch (error) {
      console.error('Failed to load registrations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'verified':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Diverifikasi</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Ditolak</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Selesai</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p>Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Peserta 👨‍🎓
          </h1>
          <p className="text-gray-600">Selamat datang, {userName}!</p>
        </div>

        {registrations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Belum Ada Pendaftaran
              </h3>
              <p className="text-gray-500 mb-4">
                Anda belum mendaftar program pelatihan apapun.
              </p>
              <Button onClick={onBack}>
                Jelajahi Program Pelatihan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="registrations">Pendaftaran</TabsTrigger>
              <TabsTrigger value="payments">Pembayaran</TabsTrigger>
              <TabsTrigger value="schedule">Jadwal</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                      {registrations.length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Total Pendaftaran</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold text-green-600">
                      {registrations.filter((r: Registration) => r.status === 'completed').length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Program Selesai</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold text-yellow-600">
                      {registrations.filter((r: Registration) => r.status === 'pending').length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Menunggu Verifikasi</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                      {registrations.filter((r: Registration) => r.status === 'verified').length}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">Aktif</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Pendaftaran Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {registrations.slice(0, 3).map((registration: Registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(registration.status)}
                          <div>
                            <p className="font-medium">Program ID: {registration.program_id}</p>
                            <p className="text-sm text-gray-500">
                              Terdaftar: {registration.registration_date.toLocaleDateString('id-ID')}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(registration.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-6">
              <div className="grid gap-6">
                {registrations.map((registration: Registration) => (
                  <Card key={registration.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>Program ID: {registration.program_id}</CardTitle>
                          <CardDescription>
                            Terdaftar pada: {registration.registration_date.toLocaleDateString('id-ID')}
                          </CardDescription>
                        </div>
                        {getStatusBadge(registration.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {registration.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">Catatan:</span> {registration.notes}
                          </p>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        Terakhir diupdate: {registration.updated_at.toLocaleDateString('id-ID')}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Riwayat Pembayaran
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Data pembayaran akan ditampilkan di sini.
                    <br />
                    <span className="text-sm">
                      (Membutuhkan integrasi dengan handler pembayaran)
                    </span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Jadwal Pelatihan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 text-center py-8">
                    Jadwal pelatihan akan ditampilkan di sini.
                    <br />
                    <span className="text-sm">
                      (Membutuhkan integrasi dengan handler jadwal)
                    </span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
