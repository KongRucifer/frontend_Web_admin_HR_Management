import { PartyPopper, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useBirthdays } from '@/api/hooks';

/** Shows a celebratory toast once per session when someone has a birthday today. */
export function BirthdayToast() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useBirthdays(2);
  const today = data?.today ?? [];
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (today.length > 0 && !sessionStorage.getItem('bday-toast-shown')) {
      sessionStorage.setItem('bday-toast-shown', '1');
      setShow(true);
      const timer = setTimeout(() => setShow(false), 9000);
      return () => clearTimeout(timer);
    }
  }, [today.length]);

  if (!show || today.length === 0) return null;

  const names = today.map((b) => `${b.firstName}`).join(', ');

  return (
    <div className="animate-pop fixed right-5 top-5 z-[70] flex max-w-xs items-start gap-3 rounded-2xl border-2 border-primary bg-card p-4 shadow-2xl shadow-primary/30 ring-2 ring-primary/30">
      <div className="brand-gradient flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white">
        <PartyPopper className="h-5 w-5" />
      </div>
      <button onClick={() => navigate('/birthdays')} className="text-left">
        <div className="font-semibold">{t('birthdays.toast_title')}</div>
        <div className="text-sm text-muted-foreground">{names}</div>
      </button>
      <button
        onClick={() => setShow(false)}
        className="ml-1 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
