import { Crosshair, MapPin, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useDeleteOfficeLocation,
  useOfficeLocations,
  useSaveOfficeLocation,
  type OfficeLocation,
} from '@/api/hooks';
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
import { toast } from '@/store/toast.store';
import { ActorCell, confirmDelete, Loading } from './_shared';

const empty = {
  name: '',
  latitude: '',
  longitude: '',
  radiusMeters: '100',
  isActive: true,
};

export function OfficeLocationsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useOfficeLocations();
  const save = useSaveOfficeLocation();
  const del = useDeleteOfficeLocation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<OfficeLocation | null>(null);
  const [form, setForm] = useState(empty);
  const [locating, setLocating] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };
  const openEdit = (o: OfficeLocation) => {
    setEditing(o);
    setForm({
      name: o.name,
      latitude: String(o.latitude),
      longitude: String(o.longitude),
      radiusMeters: String(o.radiusMeters),
      isActive: o.isActive,
    });
    setOpen(true);
  };

  // Fill lat/lng from the admin's own browser location — the easiest way to
  // pin the office is to stand in it and press this.
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t('officeLocations.geoUnsupported'));
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({
          ...f,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        }));
        setLocating(false);
      },
      () => {
        toast.error(t('officeLocations.geoDenied'));
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Guard against empty / non-numeric coordinates — Number('') is 0, which
    // would silently create an office at (0,0) off the coast of Africa.
    const lat = Number(form.latitude);
    const lng = Number(form.longitude);
    if (!form.latitude || !form.longitude || Number.isNaN(lat) || Number.isNaN(lng)) {
      toast.error(t('officeLocations.coordsRequired'));
      return;
    }
    try {
      await save.mutateAsync({
        id: editing?.id,
        name: form.name.trim(),
        latitude: lat,
        longitude: lng,
        radiusMeters: Number(form.radiusMeters) || 100,
        isActive: form.isActive,
      });
      toast.success(editing ? t('common.updated') : t('common.created'));
      setOpen(false);
    } catch (err: any) {
      // Surface the real reason instead of the dialog silently doing nothing.
      toast.error(err?.apiMessage || t('common.error'));
    }
  };

  return (
    <div>
      <PageHeader title={t('officeLocations.title')}>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" /> {t('officeLocations.new')}
        </Button>
      </PageHeader>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('officeLocations.name')}</TableHead>
                <TableHead>{t('officeLocations.coordinates')}</TableHead>
                <TableHead>{t('officeLocations.radius')}</TableHead>
                <TableHead>{t('common.status')}</TableHead>
                <TableHead>{t('common.created_by')}</TableHead>
                <TableHead className="text-right">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loading />
                  </TableCell>
                </TableRow>
              )}
              {data?.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {o.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {o.latitude}, {o.longitude}
                  </TableCell>
                  <TableCell>{o.radiusMeters} m</TableCell>
                  <TableCell>
                    <Badge variant={o.isActive ? 'success' : 'muted'}>
                      {o.isActive ? t('status.active') : t('status.inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell><ActorCell actor={o.createdBy} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(o)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(t, del.mutateAsync, o.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && data?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
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
            <DialogTitle>
              {editing ? t('common.edit') : t('officeLocations.new')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('officeLocations.name')}</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={useMyLocation} disabled={locating}>
              <Crosshair className="h-4 w-4" />
              {locating ? t('common.loading') : t('officeLocations.useMyLocation')}
            </Button>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t('officeLocations.latitude')}</Label>
                <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="17.9757" required />
              </div>
              <div className="space-y-1.5">
                <Label>{t('officeLocations.longitude')}</Label>
                <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="102.6331" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t('officeLocations.radius')} (m)</Label>
              <Input type="number" min={10} value={form.radiusMeters} onChange={(e) => setForm({ ...form, radiusMeters: e.target.value })} required />
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-input"
              />
              {t('officeLocations.active')}
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
