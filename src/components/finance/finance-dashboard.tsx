'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { FinanceForm } from './finance-form';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Plus, Edit, Trash2 } from 'lucide-react';

interface FinancialRecord {
  id: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  description?: string;
  recordedAt: string;
  serviceId?: string | null;
  service?: {
    id: string;
    serviceNumber: string;
    customer: {
      name: string;
    };
  };
}

interface FinanceSummary {
  income: number;
  expense: number;
  net: number;
  transactionCount: number;
}

export function FinanceDashboard() {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [editingRecord, setEditingRecord] = useState<FinancialRecord | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchFinanceData();
  }, [typeFilter, periodFilter]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: typeFilter,
        period: periodFilter,
        limit: '50',
      });

      const response = await fetch(`/api/finance?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setSummary(data.summary);
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Finansal veriler yüklenirken bir hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (record: FinancialRecord) => {
    setEditingRecord(record);
  };

  const handleEditSuccess = () => {
    setEditingRecord(null);
    fetchFinanceData();
  };

  const handleEditCancel = () => {
    setEditingRecord(null);
  };

  const handleDeleteRecord = async (record: FinancialRecord) => {
    if (!confirm('Bu finansal kaydı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/finance/${record.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Başarılı',
          description: 'Finansal kayıt silindi',
        });
        fetchFinanceData();
      } else {
        const data = await response.json();
        toast({
          title: 'Hata',
          description: data.error || 'Finansal kayıt silinemedi',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Bir hata oluştu',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily':
        return 'Bugün';
      case 'weekly':
        return 'Son 7 Gün';
      case 'monthly':
        return 'Son 30 Gün';
      default:
        return 'Tüm Zamanlar';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finans Yönetimi</h1>
          <p className="text-muted-foreground">
            Gelir ve gider takibi
          </p>
        </div>
        <FinanceForm onSuccess={fetchFinanceData} />
        <FinanceForm 
          record={editingRecord} 
          onSuccess={handleEditSuccess} 
          onCancel={handleEditCancel}
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tür filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="income">Gelir</SelectItem>
                <SelectItem value="expense">Gider</SelectItem>
              </SelectContent>
            </Select>

            <Select value={periodFilter} onValueChange={setPeriodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Dönem filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Zamanlar</SelectItem>
                <SelectItem value="daily">Bugün</SelectItem>
                <SelectItem value="weekly">Son 7 Gün</SelectItem>
                <SelectItem value="monthly">Son 30 Gün</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Toplam Gelir"
            value={formatCurrency(summary.income)}
            description={getPeriodLabel(periodFilter)}
            icon={TrendingUp}
          />
          <StatsCard
            title="Toplam Gider"
            value={formatCurrency(summary.expense)}
            description={getPeriodLabel(periodFilter)}
            icon={TrendingDown}
          />
          <StatsCard
            title="Net Kazanç"
            value={formatCurrency(summary.net)}
            description={getPeriodLabel(periodFilter)}
            icon={DollarSign}
          />
          <StatsCard
            title="İşlem Sayısı"
            value={summary.transactionCount}
            description={getPeriodLabel(periodFilter)}
            icon={Calendar}
          />
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Son İşlemler</CardTitle>
          <CardDescription>
            {getPeriodLabel(periodFilter)} finansal işlemler
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Bu dönemde finansal işlem bulunamadı
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Açıklama</TableHead>
                  <TableHead>Servis No</TableHead>
                  <TableHead>Müşteri</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {new Date(record.recordedAt).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.type === 'INCOME' ? 'default' : 'destructive'}>
                        {record.type === 'INCOME' ? 'Gelir' : 'Gider'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.description || '-'}
                    </TableCell>
                    <TableCell>
                      {record.service?.serviceNumber || '-'}
                    </TableCell>
                    <TableCell>
                      {record.service?.customer.name || '-'}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${
                      record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(record.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRecord(record)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}