
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, Building, Wallet, DollarSign } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import type { TrainingProgram, CreateRegistrationInput, CreatePaymentInput } from '../../../server/src/schema';

interface RegistrationFormProps {
  program: TrainingProgram;
  userId: number;
  onSuccess: () => void;
  onBack: () => void;
}

export function RegistrationForm({ program, userId, onSuccess, onBack }: RegistrationFormProps) {
  const [step, setStep] = useState<'registration' | 'payment'>('registration');
  const [isLoading, setIsLoading] = useState(false);
  const [registrationId, setRegistrationId] = useState<number | null>(null);

  const [registrationData, setRegistrationData] = useState<{
    notes: string;
  }>({
    notes: ''
  });

  const [paymentData, setPaymentData] = useState<{
    payment_method: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cash';
    transaction_id: string;
    notes: string;
  }>({
    payment_method: 'bank_transfer',
    transaction_id: '',
    notes: ''
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const registrationInput: CreateRegistrationInput = {
        user_id: userId,
        program_id: program.id,
        notes: registrationData.notes || null
      };

      const registration = await trpc.createRegistration.mutate(registrationInput);
      setRegistrationId(registration.id);
      setStep('payment');
    } catch (error) {
      console.error('Failed to create registration:', error);
      alert('Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registrationId) return;

    setIsLoading(true);

    try {
      const paymentInput: CreatePaymentInput = {
        registration_id: registrationId,
        amount: program.price,
        payment_method: paymentData.payment_method,
        transaction_id: paymentData.transaction_id || null,
        notes: paymentData.notes || null
      };

      await trpc.createPayment.mutate(paymentInput);
      alert('Pendaftaran dan pembayaran berhasil! Silakan cek dashboard Anda untuk status selanjutnya.');
      onSuccess();
    } catch (error) {
      console.error('Failed to create payment:', error);
      alert('Gagal memproses pembayaran. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'bank_transfer': return <Building className="h-4 w-4" />;
      case 'credit_card': return <CreditCard className="h-4 w-4" />;
      case 'e_wallet': return <Wallet className="h-4 w-4" />;
      case 'cash': return <DollarSign className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'bank_transfer': return 'Transfer Bank';
      case 'credit_card': return 'Kartu Kredit';
      case 'e_wallet': return 'E-Wallet (OVO, GoPay, Dana)';
      case 'cash': return 'Tunai';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack} 
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant={step === 'registration' ? 'default' : 'secondary'}>
              1. Pendaftaran
            </Badge>
            <div className="flex-1 h-px bg-gray-300"></div>
            <Badge variant={step === 'payment' ? 'default' : 'secondary'}>
              2. Pembayaran
            </Badge>
          </div>
        </div>

        {/* Program Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{program.name}</CardTitle>
            <CardDescription>{program.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Durasi:</span> {program.duration_hours} jam
              </div>
              <div>
                <span className="font-medium">Biaya:</span> {formatPrice(program.price)}
              </div>
              <div>
                <span className="font-medium">Mulai:</span> {program.start_date.toLocaleDateString('id-ID')}
              </div>
              <div>
                <span className="font-medium">Selesai:</span> {program.end_date.toLocaleDateString('id-ID')}
              </div>
            </div>
          </CardContent>
        </Card>

        {step === 'registration' ? (
          <Card>
            <CardHeader>
              <CardTitle>Form Pendaftaran 📝</CardTitle>
              <CardDescription>
                Lengkapi data pendaftaran Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegistrationSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Berikan informasi tambahan jika diperlukan..."
                    value={registrationData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setRegistrationData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">ℹ️ Informasi Penting:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Status pendaftaran akan diproses dalam 1-2 hari kerja</li>
                    <li>• Anda akan menerima konfirmasi melalui email</li>
                    <li>• Dokumen pendukung dapat diupload setelah pendaftaran</li>
                  </ul>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Memproses...' : 'Lanjut ke Pembayaran 💳'}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Pembayaran 💳</CardTitle>
              <CardDescription>
                Total yang harus dibayar: <span className="font-bold text-lg">{formatPrice(program.price)}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Metode Pembayaran</Label>
                  <Select 
                    value={paymentData.payment_method} 
                    onValueChange={(value: 'bank_transfer' | 'credit_card' | 'e_wallet' | 'cash') =>
                      setPaymentData((prev) => ({ ...prev, payment_method: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center">
                          {getPaymentMethodIcon('bank_transfer')}
                          <span className="ml-2">Transfer Bank</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="credit_card">
                        <div className="flex items-center">
                          {getPaymentMethodIcon('credit_card')}
                          <span className="ml-2">Kartu Kredit</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="e_wallet">
                        <div className="flex items-center">
                          {getPaymentMethodIcon('e_wallet')}
                          <span className="ml-2">E-Wallet</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center">
                          {getPaymentMethodIcon('cash')}
                          <span className="ml-2">Tunai</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transaction_id">ID Transaksi / Referensi</Label>
                  <Input
                    id="transaction_id"
                    placeholder="Masukkan ID transaksi atau referensi pembayaran"
                    value={paymentData.transaction_id}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPaymentData((prev) => ({ ...prev, transaction_id: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_notes">Catatan Pembayaran</Label>
                  <Textarea
                    id="payment_notes"
                    placeholder="Catatan tambahan untuk pembayaran..."
                    value={paymentData.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setPaymentData((prev) => ({ ...prev, notes: e.target.value }))
                    }
                  />
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💡 Petunjuk Pembayaran:</h4>
                  <div className="text-sm text-green-800">
                    <p className="font-medium">{getPaymentMethodLabel(paymentData.payment_method)}:</p>
                    {paymentData.payment_method === 'bank_transfer' && (
                      <div className="mt-2 space-y-1">
                        <p>• BCA: 1234567890 (a.n. EduTrain Center)</p>
                        <p>• Mandiri: 0987654321 (a.n. EduTrain Center)</p>
                        <p>• BNI: 5555666677 (a.n. EduTrain Center)</p>
                      </div>
                    )}
                    {paymentData.payment_method === 'e_wallet' && (
                      <div className="mt-2 space-y-1">
                        <p>• OVO: 081234567890</p>
                        <p>• GoPay: 081234567890</p>
                        <p>• DANA: 081234567890</p>
                      </div>
                    )}
                    {paymentData.payment_method === 'cash' && (
                      <p className="mt-2">Pembayaran tunai dapat dilakukan di kantor pusat EduTrain Center</p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? 'Memproses Pembayaran...' : 'Konfirmasi Pembayaran ✅'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
