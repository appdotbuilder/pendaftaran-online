
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Users, Calendar } from 'lucide-react';
import type { TrainingProgram } from '../../../server/src/schema';

interface ProgramCatalogProps {
  programs: TrainingProgram[];
  onProgramSelect: (program: TrainingProgram) => void;
  onBack: () => void;
}

export function ProgramCatalog({ programs, onProgramSelect, onBack }: ProgramCatalogProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Katalog Program Pelatihan 📚</h1>
          <p className="text-gray-600">Pilih program pelatihan yang sesuai dengan kebutuhan Anda</p>
        </div>

        {programs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Belum ada program pelatihan tersedia saat ini. 
                <br />
                <span className="text-sm">Silakan hubungi admin untuk informasi lebih lanjut.</span>
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program: TrainingProgram) => (
              <Card 
                key={program.id} 
                className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={program.is_active ? "default" : "secondary"}>
                      {program.is_active ? "Tersedia" : "Tidak Aktif"}
                    </Badge>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-indigo-600">
                        {formatPrice(program.price)}
                      </div>
                    </div>
                  </div>
                  <CardTitle className="text-xl">{program.name}</CardTitle>
                  <CardDescription className="text-sm line-clamp-3">
                    {program.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{program.duration_hours} jam</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Max {program.max_participants} peserta</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <div>Mulai: {formatDate(program.start_date)}</div>
                        <div>Selesai: {formatDate(program.end_date)}</div>
                      </div>
                    </div>
                  </div>

                  <Button 
                    onClick={() => onProgramSelect(program)}
                    disabled={!program.is_active}
                    className="w-full"
                  >
                    {program.is_active ? "Daftar Sekarang 🚀" : "Tidak Tersedia"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
