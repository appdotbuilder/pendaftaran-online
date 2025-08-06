
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, FileText, CreditCard, GraduationCap, Eye } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { Registration, Payment, Document, UpdateRegistrationStatusInput, UpdatePaymentStatusInput, UpdateDocumentStatusInput } from '../../../server/src/schema';

interface AdminDashboardProps {
  onBack: () => void;
}

export function AdminDashboard({ onBack }: AdminDashboardProps) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const loadData = useCallback(async () => {
    try {
      const [registrationsData, paymentsData, documentsData] = await Promise.all([
        trpc.getAllRegistrations.query(),
        trpc.getAllPayments.query(),
        trpc.getPendingDocuments.query()
      ]);
      
      setRegistrations(registrationsData);
      setPayments(paymentsData);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegistrationStatusUpdate = async (id: number, status: 'pending' | 'verified' | 'rejected' | 'completed', notes?: string) => {
    try {
      const input: UpdateRegistrationStatusInput = {
        id,
        status,
        notes: notes || null
      };
      
      await trpc.updateRegistrationStatus.mutate(input);
      
      // Update local state
      setRegistrations((prev: Registration[]) =>
        prev.map((reg: Registration) =>
          reg.id === id ? { ...reg, status, notes: notes || reg.notes } : reg
        )
      );
      alert('Status pendaftaran berhasil diupdate!');
    } catch (error) {
      console.error('Failed to update registration status:', error);
      alert('Gagal mengupdate status pendaftaran.');
    }
  };

  const handlePaymentStatusUpdate = async (id: number, status: 'pending' | 'paid' | 'failed' | 'refunded') => {
    try {
      const input: UpdatePaymentStatusInput = {
        id,
        payment_status: status,
        payment_date: status === 'paid' ? new Date() : null,
        transaction_id: null,
        notes: null
      };
      
      await trpc.updatePaymentStatus.mutate(input);
      
      // Update local state
      setPayments((prev: Payment[]) =>
        prev.map((payment: Payment) =>
          payment.id === id 
            ? { ...payment, payment_status: status, payment_date: status === 'paid' ? new Date() : payment.payment_date }
            : payment
        )
      );
      alert('Status pembayaran berhasil diupdate!');
    } catch (error) {
      console.error('Failed to update payment status:', error);
      alert('Gagal mengupdate status pembayaran.');
    }
  };

  const handleDocumentStatusUpdate = async (id: number, status: 'pending' | 'verified' | 'rejected') => {
    try {
      const input: UpdateDocumentStatusInput = {
        id,
        status,
        verified_by: status === 'verified' ? 1 : null,
        notes: null
      };
      
      await trpc.updateDocumentStatus.mutate(input);
      
      // Update local state
      setDocuments((prev: Document[]) =>
        prev.map((doc: Document) =>
          doc.id === id 
            ? { ...doc, status, verified_by: status === 'verified' ? 1 : doc.verified_by }
            : doc
        )
      );
      alert('Status dokumen berhasil diupdate!');
    } catch (error) {
      console.error('Failed to update document status:', error);
      alert('Gagal mengupdate status dokumen.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Menunggu</Badge>;
      case 'verified':
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">
          {status === 'paid' ? 'Lunas' : 'Terverifikasi'}
        </Badge>;
      case 'rejected':
      case 'failed':
        return <Badge variant="destructive">
          {status === 'failed' ? 'Gagal' : 'Ditolak'}
        </Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Selesai</Badge>;
      case 'refunded':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Refund</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Memuat data admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
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
            Dashboard Admin 👨‍💼
          </h1>
          <p className="text-gray-600">Kelola semua aspek sistem pendaftaran</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="registrations">Pendaftaran</TabsTrigger>
            <TabsTrigger value="payments">Pembayaran</TabsTrigger>
            <TabsTrigger value="documents">Dokumen</TabsTrigger>
            <TabsTrigger value="programs">Program</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-blue-600">
                      {registrations.length}
                    </CardTitle>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Total Pendaftaran</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {registrations.filter((r: Registration) => r.status === 'pending').length} menunggu verifikasi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-green-600">
                      {payments.filter((p: Payment) => p.payment_status === 'paid').length}
                    </CardTitle>
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Pembayaran Lunas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {payments.filter((p: Payment) => p.payment_status === 'pending').length} menunggu konfirmasi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-purple-600">
                      {documents.length}
                    </CardTitle>
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Dokumen Pending</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Perlu verifikasi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-orange-600">
                      {registrations.filter((r: Registration) => r.status === 'completed').length}
                    </CardTitle>
                    <GraduationCap className="h-8 w-8 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Program Selesai</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Berhasil menyelesaikan
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pendaftaran Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {registrations.slice(0, 5).map((registration: Registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Users className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">User ID: {registration.user_id}</p>
                            <p className="text-xs text-gray-500">
                              Program: {registration.program_id}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(registration.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pembayaran Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {payments.slice(0, 5).map((payment: Payment) => (
                      <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="font-medium text-sm">{formatPrice(payment.amount)}</p>
                            <p className="text-xs text-gray-500">
                              {payment.payment_method}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="registrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Pendaftaran</CardTitle>
                <CardDescription>
                  Verifikasi dan kelola status pendaftaran peserta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrations.map((registration: Registration) => (
                    <div key={registration.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">Registration ID: {registration.id}</h4>
                          <p className="text-sm text-gray-600">
                            User: {registration.user_id} | Program: {registration.program_id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Terdaftar: {registration.registration_date.toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        {getStatusBadge(registration.status)}
                      </div>
                      
                      {registration.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Catatan:</span> {registration.notes}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Select 
                          value={registration.status}
                          onValueChange={(value: 'pending' | 'verified' | 'rejected' | 'completed') =>
                            handleRegistrationStatusUpdate(registration.id, value)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="verified">Verifikasi</SelectItem>
                            <SelectItem value="rejected">Tolak</SelectItem>
                            <SelectItem value="completed">Selesai</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Pembayaran</CardTitle>
                <CardDescription>
                  Konfirmasi dan kelola status pembayaran
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payments.map((payment: Payment) => (
                    <div key={payment.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-medium">Payment ID: {payment.id}</h4>
                          <p className="text-lg font-bold text-green-600">
                            {formatPrice(payment.amount)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Metode: {payment.payment_method} | Registration: {payment.registration_id}
                          </p>
                          {payment.transaction_id && (
                            <p className="text-xs text-gray-500">
                              Transaction ID: {payment.transaction_id}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(payment.payment_status)}
                      </div>
                      
                      {payment.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Catatan:</span> {payment.notes}
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Select 
                          value={payment.payment_status}
                          onValueChange={(value: 'pending' | 'paid' | 'failed' | 'refunded') =>
                            handlePaymentStatusUpdate(payment.id, value)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Menunggu</SelectItem>
                            <SelectItem value="paid">Lunas</SelectItem>
                            <SelectItem value="failed">Gagal</SelectItem>
                            <SelectItem value="refunded">Refund</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Verifikasi Dokumen</CardTitle>
                <CardDescription>
                  Kelola dan verifikasi dokumen yang diupload peserta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Tidak ada dokumen yang perlu diverifikasi</p>
                    </div>
                  ) : (
                    documents.map((document: Document) => (
                      <div key={document.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-medium">{document.file_name}</h4>
                            <p className="text-sm text-gray-600">
                              Tipe: {document.document_type} | Registration: {document.registration_id}
                            </p>
                            <p className="text-xs text-gray-500">
                              Upload: {document.created_at.toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          {getStatusBadge(document.status)}
                        </div>
                        
                        {document.notes && (
                          <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                            <span className="font-medium">Catatan:</span> {document.notes}
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Select 
                            value={document.status}
                            onValueChange={(value: 'pending' | 'verified' | 'rejected') =>
                              handleDocumentStatusUpdate(document.id, value)
                            }
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Menunggu</SelectItem>
                              <SelectItem value="verified">Verifikasi</SelectItem>
                              <SelectItem value="rejected">Tolak</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            Lihat File
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kelola Program Pelatihan</CardTitle>
                <CardDescription>
                  Tambah, edit, dan kelola program pelatihan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Fitur manajemen program pelatihan akan tersedia di sini.
                  </p>
                  <Button>
                    Tambah Program Baru
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
