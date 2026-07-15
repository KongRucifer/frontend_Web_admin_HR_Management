import { ArrowDown, ArrowUp, Plus, Trash2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAddChain,
  useAddEmergencyPool,
  useDeleteEmergencyType,
  useDeleteLeaveType,
  useEmergencyPool,
  useEmergencyTypes,
  useLeaveChain,
  useLeaveTypes,
  useRemoveChainApprover,
  useRemoveEmergencyPool,
  useReorderChain,
  useSaveEmergencyType,
  useSaveLeaveType,
  type TypeItem,
} from '@/api/approvals';
import { ApproverPickerDialog } from '@/components/ApproverPickerDialog';
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
import { confirm } from '@/store/confirm.store';
import { toast } from '@/store/toast.store';

/** Reusable "types" section — used by both the leave and emergency cards. */
function TypeSection({
  title,
  items,
  onAdd,
  onToggle,
  onDelete,
}: {
  title: string;
  items: TypeItem[];
  onAdd: () => void;
  onToggle: (ty: TypeItem) => void;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mb-3 flex items-center justify-between">
        <div className="font-semibold">{title}</div>
        <Button size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> {t('approvals.add_type')}
        </Button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="py-3 text-center text-sm text-muted-foreground">
            {t('common.no_data')}
          </div>
        )}
        {items.map((ty) => (
          <div
            key={ty.id}
            className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
          >
            <span className="flex-1 text-sm font-medium">{ty.name}</span>
            <Badge
              variant={ty.isActive ? 'success' : 'muted'}
              className="cursor-pointer"
              onClick={() => onToggle(ty)}
            >
              {ty.isActive ? t('status.active') : t('status.inactive')}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                if (await confirm({ title: t('common.confirm_delete'), danger: true }))
                  onDelete(ty.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </>
  );
}

export function ApprovalsPage() {
  const { t } = useTranslation();

  // Leave: types + ordered approval chain
  const leaveTypes = useLeaveTypes();
  const saveLeaveType = useSaveLeaveType();
  const delLeaveType = useDeleteLeaveType();
  const chain = useLeaveChain();
  const addChain = useAddChain();
  const reorder = useReorderChain();
  const removeChain = useRemoveChainApprover();

  // Emergency (ສຸກເສີນ): types + approver pool
  const emgTypes = useEmergencyTypes();
  const saveEmgType = useSaveEmergencyType();
  const delEmgType = useDeleteEmergencyType();
  const pool = useEmergencyPool();
  const addPool = useAddEmergencyPool();
  const removePool = useRemoveEmergencyPool();

  const [chainOpen, setChainOpen] = useState(false);
  const [poolOpen, setPoolOpen] = useState(false);
  /** Which card's "add type" dialog is open (null = closed). */
  const [typeDialog, setTypeDialog] = useState<null | 'leave' | 'emergency'>(null);
  const [typeName, setTypeName] = useState('');

  const steps = chain.data ?? [];

  const move = async (index: number, dir: -1 | 1) => {
    const order = steps.map((s) => s.approverUserId);
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    await reorder.mutateAsync(order);
  };

  const createType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeDialog === 'leave') {
      await saveLeaveType.mutateAsync({ name: typeName });
    } else {
      await saveEmgType.mutateAsync({ name: typeName });
    }
    setTypeName('');
    setTypeDialog(null);
    toast.success(t('common.created'));
  };

  return (
    <div>
      <PageHeader title={t('approvals.title')} />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* ---------- LEAVE: types (top) + chain (bottom) ---------- */}
        <Card>
          <CardContent className="p-5">
            <TypeSection
              title={t('approvals.leave_types')}
              items={leaveTypes.data ?? []}
              onAdd={() => setTypeDialog('leave')}
              onToggle={(ty) =>
                saveLeaveType.mutate({ id: ty.id, isActive: !ty.isActive })
              }
              onDelete={(id) => delLeaveType.mutate(id)}
            />

            <div className="my-4 border-t border-border" />

            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t('approvals.leave_title')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('approvals.leave_hint')}
                </div>
              </div>
              <Button size="sm" onClick={() => setChainOpen(true)}>
                <UserPlus className="h-4 w-4" /> {t('approvals.add_approver')}
              </Button>
            </div>

            {steps.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                {t('approvals.no_chain')}
              </div>
            ) : (
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                      {s.stepOrder}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {s.approver?.name ?? s.approverUserId.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.approver?.phone ?? s.approver?.email ?? ''}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === 0}
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={i === steps.length - 1}
                      onClick={() => move(i, 1)}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        if (await confirm({ title: t('common.confirm_delete'), danger: true }))
                          removeChain.mutate(s.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ---------- EMERGENCY (ສຸກເສີນ): types (top) + pool (bottom) ---------- */}
        <Card>
          <CardContent className="p-5">
            <TypeSection
              title={t('approvals.emergency_types')}
              items={emgTypes.data ?? []}
              onAdd={() => setTypeDialog('emergency')}
              onToggle={(ty) =>
                saveEmgType.mutate({ id: ty.id, isActive: !ty.isActive })
              }
              onDelete={(id) => delEmgType.mutate(id)}
            />

            <div className="my-4 border-t border-border" />

            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">{t('approvals.emergency_pool')}</div>
                <div className="text-xs text-muted-foreground">
                  {t('approvals.emergency_pool_hint')}
                </div>
              </div>
              <Button size="sm" onClick={() => setPoolOpen(true)}>
                <UserPlus className="h-4 w-4" /> {t('approvals.add_approver')}
              </Button>
            </div>
            <div className="space-y-2">
              {(pool.data ?? []).length === 0 && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {t('common.no_data')}
                </div>
              )}
              {(pool.data ?? []).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {p.approver?.name ?? p.approverUserId.slice(0, 8)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {p.approver?.phone ?? p.approver?.email ?? ''}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (await confirm({ title: t('common.confirm_delete'), danger: true }))
                        removePool.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <ApproverPickerDialog
        open={chainOpen}
        onOpenChange={setChainOpen}
        title={t('approvals.add_approver')}
        excludeUserIds={steps.map((s) => s.approverUserId)}
        onConfirm={async (ids) => {
          await addChain.mutateAsync(ids);
          toast.success(t('common.created'));
        }}
      />
      <ApproverPickerDialog
        open={poolOpen}
        onOpenChange={setPoolOpen}
        title={t('approvals.add_approver')}
        excludeUserIds={(pool.data ?? []).map((p) => p.approverUserId)}
        onConfirm={async (ids) => {
          await addPool.mutateAsync(ids);
          toast.success(t('common.created'));
        }}
      />

      {/* Add-type dialog (shared by both cards) */}
      <Dialog
        open={typeDialog !== null}
        onOpenChange={(o) => !o && setTypeDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {typeDialog === 'leave'
                ? t('approvals.leave_types')
                : t('approvals.emergency_types')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={createType} className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t('approvals.type_name')}</Label>
              <Input
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTypeDialog(null)}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={saveLeaveType.isPending || saveEmgType.isPending}
              >
                {t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
