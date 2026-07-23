import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDeleteWifi, useSaveWifi, useWifiNetworks } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { WifiNetwork } from '@/types';
import { ActorCell, confirmDelete, Loading } from './_shared';

const empty = { name: '', ssid: '', bssid: '', wifiCode: '', isActive: true };

export function WifiPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useWifiNetworks();
  const save = useSaveWifi();
  const del = useDeleteWifi();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<WifiNetwork | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (w: WifiNetwork) => {
    setEditing(w);
    setForm({ name: w.name, ssid: w.ssid, bssid: w.bssid, wifiCode: w.wifiCode ?? '', isActive: w.isActive });
    setOpen(true);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await save.mutateAsync({ id: editing?.id, ...form });
    setOpen(false);
  };

  return (
    <div>
      <PageHeader title={t('wifi.title')}>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> {t('wifi.new')}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('wifi.name')}</TableHead>
                <TableHead>{t('wifi.ssid')}</TableHead>
                <TableHead>{t('wifi.bssid')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.created_by')}</TableHead>
                <TableHead>{t('common.updated_by')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    <Loading />
                  </TableCell>
                </TableRow>
              )}
              {data?.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>{w.ssid}</TableCell>
                  <TableCell className="font-mono text-xs">{w.bssid}</TableCell>
                  <TableCell>
                    <Badge variant={w.isActive ? 'success' : 'muted'}>
                      {w.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell><ActorCell actor={w.createdBy} /></TableCell>
                  <TableCell><ActorCell actor={w.updatedBy} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(w)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(t, del.mutateAsync, w.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                    {t('common.no_data')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? t('common.edit') : t('wifi.new')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('wifi.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('wifi.ssid')}</Label>
                <Input value={form.ssid} onChange={(e) => setForm({ ...form, ssid: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('wifi.bssid')}</Label>
                <Input value={form.bssid} onChange={(e) => setForm({ ...form, bssid: e.target.value })} placeholder="a4:2b:8c:11:22:33" required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('wifi.code')}</Label>
              <Input value={form.wifiCode} onChange={(e) => setForm({ ...form, wifiCode: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              {t('wifi.active')}
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
