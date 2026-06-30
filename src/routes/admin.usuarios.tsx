import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import {
  createUser, deleteUser, getCurrentSession, listUsers,
  updateUserPassword, updateUserRole, type AdminUser,
} from "@/lib/admin/auth";

export const Route = createFileRoute("/admin/usuarios")({ component: UsersPage });

function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", role: "admin" as AdminUser["role"] });
  const me = getCurrentSession();

  async function reload() { setUsers(await listUsers()); }
  useEffect(() => { reload(); }, []);

  async function onCreate() {
    const r = await createUser(form);
    if (!r.ok) { toast.error(r.error ?? "Erro."); return; }
    toast.success("Usuário criado.");
    setForm({ email: "", password: "", role: "admin" });
    setOpen(false);
    reload();
  }

  return (
    <>
      <PageHeader
        title="Usuários"
        description="Apenas admins autenticados criam novos usuários. Não há cadastro público."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 gap-1.5"><Plus className="h-4 w-4" />Novo usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Novo usuário</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1" /></div>
                <div><Label>Senha</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1" /></div>
                <div>
                  <Label>Papel</Label>
                  <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as AdminUser["role"] })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="editor">editor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button onClick={onCreate}>Criar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <SectionCard>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr><th className="py-2">Email</th><th className="py-2">Papel</th><th className="py-2">Criado em</th><th className="py-2 text-right">Ações</th></tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Nenhum usuário (faça login com o admin do .env para semear).</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100">
                <td className="py-2 font-medium">{u.email}{me?.userId === u.id && <span className="ml-2 text-[10px] text-amber-600 uppercase">você</span>}</td>
                <td className="py-2">
                  <Select value={u.role} onValueChange={async (v) => { await updateUserRole(u.id, v as AdminUser["role"]); toast.success("Papel atualizado."); reload(); }}>
                    <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">admin</SelectItem>
                      <SelectItem value="editor">editor</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="py-2 text-slate-500">{new Date(u.createdAt).toLocaleString("pt-BR")}</td>
                <td className="py-2 text-right">
                  <ResetPassword id={u.id} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-rose-600" disabled={me?.userId === u.id}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                        <AlertDialogDescription>{u.email}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={async () => { await deleteUser(u.id); toast.success("Removido."); reload(); }}>Excluir</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionCard>
    </>
  );
}

function ResetPassword({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [pw, setPw] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="mr-1">Senha</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Definir nova senha</DialogTitle></DialogHeader>
        <Input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Nova senha" />
        <DialogFooter>
          <Button onClick={async () => { await updateUserPassword(id, pw); toast.success("Senha atualizada."); setOpen(false); setPw(""); }}>Atualizar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
