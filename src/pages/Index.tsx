import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';
import AdminPanel from '@/components/AdminPanel';
import { API, COUNTRIES, flagOf, type Post, type Stream } from '@/lib/mcfa';

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
  { pos: 1, team: 'КНДР', p: 5, w: 5, d: 0, l: 0, gd: '+18', pts: 15 },
  { pos: 2, team: 'Россия', p: 5, w: 4, d: 1, l: 0, gd: '+12', pts: 13 },
  { pos: 3, team: 'Китай', p: 5, w: 3, d: 1, l: 1, gd: '+7', pts: 10 },
  { pos: 4, team: 'Иран', p: 5, w: 2, d: 2, l: 1, gd: '+3', pts: 8 },
  { pos: 5, team: 'Сербия', p: 5, w: 1, d: 1, l: 3, gd: '-5', pts: 4 },
  { pos: 6, team: 'Египет', p: 5, w: 0, d: 1, l: 4, gd: '-14', pts: 1 },
];



const Index = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [nick, setNick] = useState('');
  const [country, setCountry] = useState('');
  const [roleWish, setRoleWish] = useState('');
  const [skin, setSkin] = useState<string | null>(null);
  const [skinName, setSkinName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadPosts = useCallback(async () => {
    const res = await fetch(`${API}?action=posts`);
    if (res.ok) setPosts((await res.json()).posts);
  }, []);

  const loadStreams = useCallback(async () => {
    const res = await fetch(`${API}?action=streams`);
    if (res.ok) setStreams((await res.json()).streams);
  }, []);

  useEffect(() => {
    loadPosts();
    loadStreams();
  }, [loadPosts, loadStreams]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const onSkinPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'image/png') {
      toast({ title: 'Скин должен быть в формате PNG', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSkin(reader.result as string);
      setSkinName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nick.trim() || !country) {
      toast({ title: 'Укажите ник и страну', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const res = await fetch(`${API}?action=register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, country, role_wish: roleWish, skin }),
    });
    setSubmitting(false);
    if (res.ok) {
      toast({
        title: 'Заявка отправлена!',
        description: 'Ожидайте подтверждения администратором.',
      });
      setNick('');
      setCountry('');
      setRoleWish('');
      setSkin(null);
      setSkinName('');
      if (fileRef.current) fileRef.current.value = '';
    } else {
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <button onClick={() => scrollTo('home')}>
            <Logo className="h-10" />
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
            <AdminPanel onPostsChange={loadPosts} onStreamsChange={loadStreams} />
            <Button
              onClick={() => scrollTo('register')}
              className="hidden bg-dprk-red text-white hover:bg-dprk-red/90 sm:inline-flex"
            >
              Участвовать
            </Button>
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
          <img src={HERO_IMG} alt="Стадион MCFA" className="h-full w-full object-cover" />
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
              по футболу в <span className="text-dprk-red">Minecraft</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/85">
              MCFA 2026 — главный турнир года. 16 сборных, воксельные стадионы,
              прямые трансляции матчей и путь к чемпионскому кубку.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => scrollTo('register')} className="bg-dprk-red text-white hover:bg-dprk-red/90">
                <Icon name="UserPlus" size={18} className="mr-2" />
                Зарегистрироваться
              </Button>
              <Button size="lg" onClick={() => scrollTo('streams')} variant="outline" className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 hover:text-white">
                <Icon name="Radio" size={18} className="mr-2" />
                Смотреть трансляции
              </Button>
            </div>
            <div className="mt-12 grid max-w-lg grid-cols-3 gap-4">
              {[
                { n: '16', l: 'Сборных' },
                { n: '48', l: 'Матчей' },
                { n: '12', l: 'Стадионов' },
              ].map((s) => (
                <div key={s.l} className="border-l-2 border-dprk-red pl-3">
                  <div className="font-display text-3xl font-bold text-white">{s.n}</div>
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
              Выберите сборную, загрузите свой скин в развёрнутом формате и укажите,
              кем хотите быть на поле. После проверки администратором вы попадёте
              в официальный реестр MCFA 2026.
            </p>
            <ul className="mt-8 space-y-4">
              {[
                { icon: 'Flag', t: '16 сборных', d: 'Выберите страну, за которую играете.' },
                { icon: 'Image', t: 'Ваш скин', d: 'Загрузите PNG-файл скина Minecraft.' },
                { icon: 'ShieldCheck', t: 'Модерация', d: 'Заявки одобряет администратор турнира.' },
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
                <Input id="nick" value={nick} onChange={(e) => setNick(e.target.value)} placeholder="Steve_Kim" className="mt-1.5" />
              </div>
              <div>
                <Label>Сборная (страна) *</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Выберите страну" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.name} value={c.name}>
                        {c.flag} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="role">Кем хотите быть?</Label>
                <Textarea
                  id="role"
                  value={roleWish}
                  onChange={(e) => setRoleWish(e.target.value)}
                  placeholder="Например: нападающий, капитан команды, вратарь..."
                  className="mt-1.5"
                  rows={2}
                />
              </div>
              <div>
                <Label>Скин Minecraft (PNG, развёрнутый формат)</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png"
                  onChange={onSkinPick}
                  className="hidden"
                  id="skin-input"
                />
                <label
                  htmlFor="skin-input"
                  className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border p-3 transition-colors hover:border-dprk-red"
                >
                  {skin ? (
                    <img src={skin} alt="Скин" className="h-16 w-12 rounded border border-border object-cover [image-rendering:pixelated]" />
                  ) : (
                    <div className="flex h-16 w-12 items-center justify-center rounded bg-muted text-muted-foreground">
                      <Icon name="Upload" size={20} />
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground">
                    {skinName || 'Нажмите, чтобы загрузить PNG-файл скина'}
                  </span>
                </label>
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-dprk-red text-white hover:bg-dprk-red/90">
                {submitting ? 'Отправка...' : 'Подать заявку'}
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
                  <th className="px-4 py-3 font-medium">Сборная</th>
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
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold ${r.pos <= 2 ? 'bg-dprk-red text-white' : 'bg-muted text-foreground'}`}>
                        {r.pos}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold">{flagOf(r.team)} {r.team}</td>
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
          {streams.length === 0 ? (
            <p className="mt-8 text-muted-foreground">Трансляций пока нет. Скоро здесь появятся прямые эфиры.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {streams.map((s) => (
                <a
                  key={s.id}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-lg"
                >
                  <div className="relative flex aspect-video items-center justify-center bg-dprk-blue">
                    <Icon name="Play" size={44} className="text-white/80 transition-transform group-hover:scale-110" />
                    {s.is_live ? (
                      <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded bg-dprk-red px-2 py-1 text-xs font-bold text-white">
                        <span className="inline-block h-2 w-2 animate-pulse-live rounded-full bg-white" />
                        LIVE
                      </span>
                    ) : (
                      <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-1 text-xs font-medium text-white">Скоро</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold">{s.title}</div>
                    {s.teams && (
                      <div className="mt-0.5 text-sm text-muted-foreground">{s.teams}</div>
                    )}
                    {s.scheduled_at && !s.is_live && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Icon name="Clock" size={12} />
                        {new Date(s.scheduled_at).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* News */}
      <section id="news" className="border-b border-border bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <SectionTitle sub="Блог">Новости турнира</SectionTitle>
          {posts.length === 0 ? (
            <p className="mt-8 text-muted-foreground">Новостей пока нет. Скоро здесь появятся первые публикации.</p>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {posts.map((n) => (
                <article key={n.id} className="flex flex-col rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-lg">
                  <div className="mb-3 flex items-center gap-3">
                    {n.tag && (
                      <Badge className="border-0 bg-dprk-red/10 text-dprk-red hover:bg-dprk-red/10">{n.tag}</Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(n.created_at).toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-semibold leading-tight">{n.title}</h3>
                  <p className="mt-2 flex-1 whitespace-pre-line text-sm text-muted-foreground">{n.body}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contacts + Footer */}
      <section id="contacts" className="bg-dprk-blue py-20 text-white">
        <div className="container mx-auto grid gap-12 px-4 md:grid-cols-2">
          <div>
            <SectionTitle light sub="Связь">Контакты</SectionTitle>
            <p className="mt-4 max-w-md text-white/75">
              Есть вопросы по участию, трансляциям или партнёрству? Свяжитесь с оргкомитетом MCFA 2026.
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
              <Button type="submit" className="w-full bg-dprk-red text-white hover:bg-dprk-red/90">Отправить</Button>
            </form>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row">
          <Logo className="h-8" />
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
    <span className={`text-sm font-semibold uppercase tracking-widest ${light ? 'text-white/60' : 'text-dprk-red'}`}>
      {sub}
    </span>
    <h2 className="mt-1 font-display text-4xl font-bold uppercase md:text-5xl">{children}</h2>
  </div>
);

export default Index;