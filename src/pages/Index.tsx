import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

const HERO_IMG =
  'https://cdn.poehali.dev/projects/03c39951-0df9-473a-9e75-b8e2a7af085a/files/1514e7b3-fe3b-4a86-b1a9-87b6f1549f23.jpg';

const NAV = [
  { id: 'home', label: 'Главная' },
  { id: 'register', label: 'Регистрация' },
  { id: 'table', label: 'Таблица' },
  { id: 'streams', label: 'Трансляции' },
  { id: 'news', label: 'Новости' },
  { id: 'contacts', label: 'Контакты' },
];

const STANDINGS = [
  { pos: 1, team: 'Pyongyang Blocks', p: 5, w: 5, d: 0, l: 0, gd: '+18', pts: 15 },
  { pos: 2, team: 'Redstone United', p: 5, w: 4, d: 1, l: 0, gd: '+12', pts: 13 },
  { pos: 3, team: 'Diamond FC', p: 5, w: 3, d: 1, l: 1, gd: '+7', pts: 10 },
  { pos: 4, team: 'Creeper City', p: 5, w: 2, d: 2, l: 1, gd: '+3', pts: 8 },
  { pos: 5, team: 'Nether Rangers', p: 5, w: 1, d: 1, l: 3, gd: '-5', pts: 4 },
  { pos: 6, team: 'End Portal SC', p: 5, w: 0, d: 1, l: 4, gd: '-14', pts: 1 },
];

const NEWS = [
  {
    tag: 'Церемония',
    date: '15 июня 2026',
    title: 'MCFA 2026 официально открыт в Пхеньяне',
    text: 'Грандиозная церемония открытия чемпионата собрала более 200 команд со всего мира на воксельной арене.',
  },
  {
    tag: 'Матч дня',
    date: '18 июня 2026',
    title: 'Pyongyang Blocks разгромили End Portal SC 6:0',
    text: 'Хозяева турнира показали блестящую игру и уверенно возглавили турнирную таблицу группы А.',
  },
  {
    tag: 'Правила',
    date: '12 июня 2026',
    title: 'Опубликован регламент серверных матчей',
    text: 'Все участники обязаны использовать официальную сборку клиента и соблюдать fair-play на поле.',
  },
];

const STREAMS = [
  { live: true, teams: 'Pyongyang Blocks — Diamond FC', time: 'Идёт сейчас', viewers: '4 812' },
  { live: false, teams: 'Redstone United — Creeper City', time: 'Сегодня 19:00', viewers: '—' },
  { live: false, teams: 'Nether Rangers — End Portal SC', time: 'Завтра 17:30', viewers: '—' },
];

type Applicant = {
  id: number;
  nick: string;
  team: string;
  status: 'pending' | 'approved' | 'rejected';
};

const Index = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([
    { id: 1, nick: 'Steve_Kim', team: 'Pyongyang Blocks', status: 'pending' },
    { id: 2, nick: 'CreeperKing', team: 'Creeper City', status: 'approved' },
    { id: 3, nick: 'RedstoneRy', team: 'Redstone United', status: 'pending' },
  ]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRegister = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const nick = String(data.get('nick') || '').trim();
    const team = String(data.get('team') || '').trim();
    if (!nick || !team) return;
    setApplicants((prev) => [
      ...prev,
      { id: Date.now(), nick, team, status: 'pending' },
    ]);
    toast({
      title: 'Заявка отправлена!',
      description: 'Ваша регистрация ожидает подтверждения администратором.',
    });
    form.reset();
  };

  const setStatus = (id: number, status: Applicant['status']) => {
    setApplicants((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a)),
    );
  };

  const pendingCount = applicants.filter((a) => a.status === 'pending').length;

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button
            onClick={() => scrollTo('home')}
            className="flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded bg-dprk-red">
              <Icon name="Trophy" size={20} className="text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              MCFA<span className="text-dprk-red">.</span>26
            </span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => scrollTo(n.id)}
                className="rounded px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <AdminPanel
              applicants={applicants}
              setStatus={setStatus}
              pendingCount={pendingCount}
            />
            <Button
              onClick={() => scrollTo('register')}
              className="hidden bg-dprk-red text-white hover:bg-dprk-red/90 sm:inline-flex"
            >
              Участвовать
            </Button>

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Icon name="Menu" size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <nav className="mt-8 flex flex-col gap-1">
                  {NAV.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => scrollTo(n.id)}
                      className="rounded px-3 py-3 text-left text-base font-medium hover:bg-muted"
                    >
                      {n.label}
                    </button>
                  ))}
                  <Button
                    onClick={() => scrollTo('register')}
                    className="mt-4 bg-dprk-red text-white hover:bg-dprk-red/90"
                  >
                    Участвовать
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={HERO_IMG}
            alt="Стадион MCFA"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-dprk-blue/70 to-dprk-blue/40" />
        </div>

        <div className="container relative mx-auto px-4 py-24 md:py-36">
          <div className="max-w-3xl animate-fade-in">
            <Badge className="mb-6 border-0 bg-dprk-red text-white hover:bg-dprk-red">
              <span className="mr-2 inline-block h-2 w-2 animate-pulse-live rounded-full bg-white" />
              КНДР · 2026
            </Badge>
            <h1 className="font-display text-5xl font-bold uppercase leading-none text-white md:text-7xl">
              Чемпионат мира
              <br />
              по футболу в{' '}
              <span className="text-dprk-red">Minecraft</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              MCFA 2026 — главный турнир года. 200+ команд, воксельные стадионы,
              прямые трансляции матчей и путь к чемпионскому кубку.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                onClick={() => scrollTo('register')}
                className="bg-dprk-red text-white hover:bg-dprk-red/90"
              >
                <Icon name="UserPlus" size={18} className="mr-2" />
                Зарегистрироваться
              </Button>
              <Button
                size="lg"
                onClick={() => scrollTo('streams')}
                variant="outline"
                className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white"
              >
                <Icon name="Radio" size={18} className="mr-2" />
                Смотреть трансляции
              </Button>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4">
              {[
                { n: '200+', l: 'Команд' },
                { n: '48', l: 'Матчей' },
                { n: '12', l: 'Стадионов' },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-dprk-red pl-3">
                  <div className="font-display text-3xl font-bold text-white">
                    {s.n}
                  </div>
                  <div className="text-sm text-white/70">{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="register" className="border-b border-border py-20">
        <div className="container mx-auto grid gap-12 px-4 lg:grid-cols-2">
          <div>
            <SectionTitle sub="Заявка">Регистрация участника</SectionTitle>
            <p className="mt-4 max-w-md text-muted-foreground">
              Заполните форму, чтобы подать заявку на участие в MCFA 2026. После
              проверки администратором вы получите доступ к профилю участника.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: 'ShieldCheck', t: 'Модерация заявок', d: 'Каждый участник проходит проверку админом.' },
                { icon: 'Users', t: 'Командный зачёт', d: 'Играйте за свою команду в групповом этапе.' },
                { icon: 'Award', t: 'Официальный статус', d: 'Одобренные участники попадают в реестр MCFA.' },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-dprk-blue/10 text-dprk-blue">
                    <Icon name={f.icon} size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{f.t}</div>
                    <div className="text-sm text-muted-foreground">{f.d}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div>
                <Label htmlFor="nick">Игровой ник *</Label>
                <Input id="nick" name="nick" placeholder="Steve_Kim" className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="team">Название команды *</Label>
                <Input id="team" name="team" placeholder="Pyongyang Blocks" className="mt-1.5" required />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="player@mcfa.kp" className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="about">О себе</Label>
                <Textarea id="about" name="about" placeholder="Опыт, позиция на поле, достижения..." className="mt-1.5" rows={3} />
              </div>
              <Button type="submit" className="w-full bg-dprk-red text-white hover:bg-dprk-red/90">
                Подать заявку
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Standings */}
      <section id="table" className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <SectionTitle sub="Группа A">Турнирная таблица</SectionTitle>
          <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-dprk-blue text-white">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Команда</th>
                  <th className="px-4 py-3 text-center font-medium">И</th>
                  <th className="px-4 py-3 text-center font-medium">В</th>
                  <th className="px-4 py-3 text-center font-medium">Н</th>
                  <th className="px-4 py-3 text-center font-medium">П</th>
                  <th className="px-4 py-3 text-center font-medium">РМ</th>
                  <th className="px-4 py-3 text-center font-medium">О</th>
                </tr>
              </thead>
              <tbody>
                {STANDINGS.map((r) => (
                  <tr key={r.pos} className="border-b border-border last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${
                          r.pos <= 2 ? 'bg-dprk-red text-white' : 'bg-muted text-foreground'
                        }`}
                      >
                        {r.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{r.team}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.p}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.w}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.d}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.l}</td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{r.gd}</td>
                    <td className="px-4 py-3 text-center font-display text-base font-bold">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Streams */}
      <section id="streams" className="border-b border-border py-20">
        <div className="container mx-auto px-4">
          <SectionTitle sub="Live">Трансляции матчей</SectionTitle>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {STREAMS.map((s, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
              >
                <div className="relative flex aspect-video items-center justify-center bg-dprk-blue">
                  <Icon name="Play" size={44} className="text-white/80 transition-transform group-hover:scale-110" />
                  {s.live ? (
                    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-dprk-red px-2 py-1 text-xs font-bold text-white">
                      <span className="inline-block h-2 w-2 animate-pulse-live rounded-full bg-white" />
                      LIVE
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">
                      Скоро
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-semibold">{s.teams}</div>
                  <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Icon name="Clock" size={14} /> {s.time}
                    </span>
                    {s.live && (
                      <span className="flex items-center gap-1">
                        <Icon name="Eye" size={14} /> {s.viewers}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* News */}
      <section id="news" className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <SectionTitle sub="Блог">Новости турнира</SectionTitle>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {NEWS.map((n) => (
              <article
                key={n.title}
                className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg"
              >
                <div className="mb-3 flex items-center gap-3">
                  <Badge className="border-0 bg-dprk-red/10 text-dprk-red hover:bg-dprk-red/10">
                    {n.tag}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{n.date}</span>
                </div>
                <h3 className="font-display text-xl font-semibold leading-tight">{n.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{n.text}</p>
                <button className="mt-4 flex items-center gap-1 text-sm font-medium text-dprk-blue hover:underline">
                  Читать <Icon name="ArrowRight" size={14} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts + Footer */}
      <section id="contacts" className="bg-dprk-blue py-20 text-white">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2">
          <div>
            <SectionTitle light sub="Связь">Контакты</SectionTitle>
            <p className="mt-4 max-w-md text-white/75">
              Есть вопросы по участию, трансляциям или партнёрству? Свяжитесь с
              оргкомитетом MCFA 2026.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: 'Mail', t: 'org@mcfa2026.kp' },
                { icon: 'Send', t: 't.me/mcfa2026' },
                { icon: 'MapPin', t: 'Пхеньян, КНДР · Стадион имени Первого мая' },
              ].map((c) => (
                <div key={c.t} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-white/10">
                    <Icon name={c.icon} size={18} />
                  </div>
                  <span>{c.t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white/10 p-6 backdrop-blur md:p-8">
            <h3 className="font-display text-xl font-semibold">Написать нам</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast({ title: 'Сообщение отправлено!', description: 'Мы ответим в ближайшее время.' });
                (e.currentTarget as HTMLFormElement).reset();
              }}
              className="mt-5 space-y-4"
            >
              <Input name="name" placeholder="Ваше имя" className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
              <Input name="email" type="email" placeholder="Email" className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
              <Textarea name="msg" placeholder="Сообщение" rows={3} className="border-white/20 bg-white/10 text-white placeholder:text-white/50" />
              <Button type="submit" className="w-full bg-dprk-red text-white hover:bg-dprk-red/90">
                Отправить
              </Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-dprk-red">
              <Icon name="Trophy" size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-foreground">MCFA.26</span>
          </div>
          <span>© 2026 MCFA · Minecraft Championship of Football Association</span>
        </div>
      </footer>
    </div>
  );
};

const SectionTitle = ({
  children,
  sub,
  light,
}: {
  children: React.ReactNode;
  sub: string;
  light?: boolean;
}) => (
  <div>
    <span
      className={`text-sm font-semibold uppercase tracking-widest ${
        light ? 'text-white/60' : 'text-dprk-red'
      }`}
    >
      {sub}
    </span>
    <h2 className="mt-1 font-display text-4xl font-bold uppercase md:text-5xl">
      {children}
    </h2>
  </div>
);

const AdminPanel = ({
  applicants,
  setStatus,
  pendingCount,
}: {
  applicants: Applicant[];
  setStatus: (id: number, status: Applicant['status']) => void;
  pendingCount: number;
}) => {
  const statusMap = {
    pending: { label: 'Ожидает', cls: 'bg-amber-100 text-amber-700' },
    approved: { label: 'Одобрен', cls: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Отклонён', cls: 'bg-red-100 text-red-700' },
  } as const;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Icon name="Shield" size={18} />
          {pendingCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-dprk-red text-[10px] font-bold text-white">
              {pendingCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Icon name="Shield" size={22} className="text-dprk-red" />
            Админ-панель · Заявки
          </DialogTitle>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto py-2">
          {applicants.map((a) => (
            <div
              key={a.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{a.nick}</span>
                  <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusMap[a.status].cls}`}>
                    {statusMap[a.status].label}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">{a.team}</div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => setStatus(a.id, 'approved')}
                  disabled={a.status === 'approved'}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Icon name="Check" size={16} className="mr-1" /> Одобрить
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setStatus(a.id, 'rejected')}
                  disabled={a.status === 'rejected'}
                  className="text-red-600 hover:text-red-700"
                >
                  <Icon name="X" size={16} className="mr-1" /> Отклонить
                </Button>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="text-sm text-muted-foreground">
          Всего заявок: {applicants.length} · Ожидают: {pendingCount}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Index;
