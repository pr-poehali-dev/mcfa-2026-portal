import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';
import { API, flagOf, type Applicant, type Post } from '@/lib/mcfa';

const statusMap = {
  pending: { label: 'Ожидает', cls: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Одобрен', cls: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Отклонён', cls: 'bg-red-100 text-red-700' },
} as const;

const AdminPanel = ({ onPostsChange }: { onPostsChange: () => void }) => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [pTitle, setPTitle] = useState('');
  const [pTag, setPTag] = useState('');
  const [pBody, setPBody] = useState('');

  const load = useCallback(async (pass: string) => {
    const [aRes, pRes] = await Promise.all([
      fetch(`${API}?action=applicants`, { headers: { 'X-Admin-Password': pass } }),
      fetch(`${API}?action=posts`),
    ]);
    if (aRes.ok) setApplicants((await aRes.json()).applicants);
    if (pRes.ok) setPosts((await pRes.json()).posts);
  }, []);

  const login = async () => {
    setLoading(true);
    const res = await fetch(`${API}?action=login`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      setAuthed(true);
      await load(password);
    } else {
      toast({ title: 'Неверный пароль', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (open && authed) load(password);
  }, [open, authed, password, load]);

  const setStatus = async (id: number, status: Applicant['status']) => {
    await fetch(`${API}?action=applicant`, {
      method: 'PUT',
      headers: { 'X-Admin-Password': password },
      body: JSON.stringify({ id, status }),
    });
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const createPost = async () => {
    if (!pTitle.trim() || !pBody.trim()) {
      toast({ title: 'Заполните заголовок и текст', variant: 'destructive' });
      return;
    }
    const res = await fetch(`${API}?action=post`, {
      method: 'POST',
      headers: { 'X-Admin-Password': password },
      body: JSON.stringify({ title: pTitle, tag: pTag, body: pBody }),
    });
    if (res.ok) {
      toast({ title: 'Пост опубликован!' });
      setPTitle('');
      setPTag('');
      setPBody('');
      await load(password);
      onPostsChange();
    }
  };

  const deletePost = async (id: number) => {
    await fetch(`${API}?action=post&id=${id}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': password },
    });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    onPostsChange();
  };

  const pending = applicants.filter((a) => a.status === 'pending').length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Админ-панель">
          <Icon name="Shield" size={18} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Icon name="Shield" size={22} className="text-dprk-red" />
            Админ-панель MCFA
          </DialogTitle>
        </DialogHeader>

        {!authed ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="adm">Пароль администратора</Label>
              <Input
                id="adm"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && login()}
                placeholder="••••••••"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <Button onClick={login} disabled={loading} className="w-full bg-dprk-red text-white hover:bg-dprk-red/90">
              {loading ? 'Проверка...' : 'Войти'}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="apps" className="mt-2">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="apps">
                Заявки {pending > 0 && <span className="ml-1.5 rounded-full bg-dprk-red px-1.5 text-xs text-white">{pending}</span>}
              </TabsTrigger>
              <TabsTrigger value="posts">Новости</TabsTrigger>
            </TabsList>

            <TabsContent value="apps" className="max-h-[60vh] space-y-3 overflow-y-auto py-2">
              {applicants.length === 0 && (
                <p className="py-8 text-center text-muted-foreground">Пока нет заявок.</p>
              )}
              {applicants.map((a) => (
                <div key={a.id} className="flex flex-col gap-3 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    {a.skin_url ? (
                      <img src={a.skin_url} alt={a.nick} className="h-16 w-12 rounded border border-border object-cover [image-rendering:pixelated]" />
                    ) : (
                      <div className="flex h-16 w-12 items-center justify-center rounded bg-muted text-muted-foreground">
                        <Icon name="User" size={20} />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{a.nick}</span>
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusMap[a.status].cls}`}>
                          {statusMap[a.status].label}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {flagOf(a.country)} {a.country}
                      </div>
                      {a.role_wish && (
                        <div className="mt-0.5 text-xs text-muted-foreground">Хочет быть: {a.role_wish}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setStatus(a.id, 'approved')} disabled={a.status === 'approved'} className="bg-emerald-600 text-white hover:bg-emerald-700">
                      <Icon name="Check" size={16} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(a.id, 'rejected')} disabled={a.status === 'rejected'} className="text-red-600">
                      <Icon name="X" size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            <TabsContent value="posts" className="max-h-[60vh] space-y-4 overflow-y-auto py-2">
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="font-display text-lg font-semibold">Новый пост</div>
                <Input placeholder="Заголовок" value={pTitle} onChange={(e) => setPTitle(e.target.value)} />
                <Input placeholder="Тег (напр. Матч дня)" value={pTag} onChange={(e) => setPTag(e.target.value)} />
                <Textarea placeholder="Текст новости" rows={3} value={pBody} onChange={(e) => setPBody(e.target.value)} />
                <Button onClick={createPost} className="bg-dprk-red text-white hover:bg-dprk-red/90">
                  <Icon name="Send" size={16} className="mr-2" /> Опубликовать
                </Button>
              </div>
              {posts.map((p) => (
                <div key={p.id} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                  <div>
                    <div className="text-xs text-dprk-red">{p.tag}</div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">{p.body}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deletePost(p.id)} className="text-red-600">
                    <Icon name="Trash2" size={16} />
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
