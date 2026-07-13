import { Cake, Gift, PartyPopper } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBirthdays } from '@/api/hooks';
import { PageHeader } from '@/components/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Confetti } from '@/components/ui/confetti';
import type { Birthday } from '@/types';

const initials = (b: Birthday) =>
  `${b.firstName?.[0] ?? ''}${b.lastName?.[0] ?? ''}`.toUpperCase();

/** "DD/MM" of a YYYY-MM-DD string (year is irrelevant for birthdays). */
const dayMonth = (iso: string) => {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
};

export function BirthdaysPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useBirthdays(2);

  const today = data?.today ?? [];
  const upcoming = data?.upcoming ?? [];

  return (
    <div>
      {/* Celebration when someone has a birthday today */}
      {today.length > 0 && <Confetti />}

      <PageHeader title={t('birthdays.title')} />

      {/* ---- Today ---- */}
      <div className="mb-2 flex items-center gap-2">
        <PartyPopper className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">
          {t('birthdays.today')}
          {today.length > 0 && (
            <span className="text-muted-foreground"> ({today.length})</span>
          )}
        </h2>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">
          {t('common.loading')}
        </div>
      ) : today.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
            <Cake className="h-8 w-8 opacity-40" />
            {t('birthdays.none_today')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {today.map((b, i) => (
            <div
              key={b.id}
              className="brand-gradient animate-pop relative overflow-hidden rounded-2xl p-5 text-white shadow-lg shadow-primary/30"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <PartyPopper className="absolute -right-2 -top-2 h-16 w-16 opacity-20" />
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 text-lg font-bold backdrop-blur">
                  {initials(b)}
                </div>
                <div>
                  <div className="text-lg font-semibold leading-tight">
                    {b.firstName} {b.lastName}
                  </div>
                  <div className="text-sm text-white/80">
                    {b.department ?? '-'}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                <Cake className="h-4 w-4" />
                {t('birthdays.turns', { age: b.age })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ---- Upcoming ---- */}
      <div className="mb-2 mt-8 flex items-center gap-2">
        <Gift className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold">{t('birthdays.upcoming')}</h2>
      </div>

      <Card>
        <CardContent className="p-3">
          {upcoming.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground">
              {t('birthdays.none_upcoming')}
            </div>
          ) : (
            <div className="space-y-2">
              {upcoming.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Cake className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {b.firstName} {b.lastName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.department ?? '-'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">
                      {dayMonth(b.birthDate)}
                    </div>
                    <Badge variant={b.daysLeft === 1 ? 'warning' : 'default'}>
                      {b.daysLeft === 1
                        ? t('birthdays.tomorrow')
                        : t('birthdays.in_days', { days: b.daysLeft })}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
