import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { getCurrentSession } from "@/lib/admin/auth";
import {
  listAdmins,
  grantAdminByEmail,
  revokeAdmin,
  type AdminListItem,
} from "@/lib/adminUsers.functions";

export const Route = createFileRoute("/admin/usuarios")({ component: UsersPage });

function UsersPage() {
  const fetchList = useServerFn(listAdmins);
  const doGrant = useServerFn(grantAdminByEmail);
  const doRevoke = useServerFn(revokeAdmin);

  const [users, setUsers] = useState<AdminListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const me = getCurrentSession();

  async function reload() {
    setLoading(true);
    try {
      const rows = await fetchList();
      setUsers(rows);
    } catch (e: unknown) {
      toast.error((e as Error).message || "Falha ao carregar admins.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { reload(); }, []);

  async function onGrant() {
    try {
      await doGrant({ data: { email } });
      toast.success("Acesso admin concedido.");
      setEmail("");
      setOpen(false);
      reload();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Falha ao conceder acesso.");
    }
  }

  async function onRevoke(userId: string) {
    try {
      await doRevoke({ data: { user_id: userId } });
      toast.success("Acesso removido.");
      reload();
    } catch (e: unknown) {
      toast.error((e as Error).message || "Falha ao remover acesso.");
    }
  }

  return (
    <>
      <PageHeader
        title="Administradores"
        description="Gerencie quem tem acesso ao painel. O usuário precisa criar conta em /auth primeiro; depois um admin libera o acesso aqui."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-slate-900 hover:bg-slate-800 gap-1.5">
                <Plus className="h-4 w-4" />Liberar acesso
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Liberar acesso admin</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label>Email do usuário</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                    placeholder="usuario@exemplo.com"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    O usuário precisa ter criado a conta em <code>/auth</code> antes.
                  </p>
                </div>
              </div>
              <DialogFooter><Button onClick={onGrant}>Conceder admin</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <SectionCard>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2">Email</th>
              <th className="py-2">Papel</th>
              <th className="py-2">Concedido em</th>
              <th className="py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Carregando…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="py-8 text-center text-slate-400">Nenhum admin cadastrado.</td></tr>
            ) : users.map((u) => (
              <tr key={u.user_id} className="border-b border-slate-100">
                <td className="py-2 font-medium">
                  {u.email}
                  {me?.userId === u.user_id && <span className="ml-2 text-[10px] text-amber-600 uppercase">você</span>}
                </td>
                <td className="py-2 text-slate-600">admin</td>
                <td className="py-2 text-slate-500">
                  {u.created_at ? new Date(u.created_at).toLocaleString("pt-BR") : "—"}
                </td>
                <td className="py-2 text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost" size="sm" className="text-rose-600"
                        disabled={me?.userId === u.user_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover acesso admin?</AlertDialogTitle>
                        <AlertDialogDescription>
                          {u.email} perderá acesso ao painel. A conta em si não é excluída.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onRevoke(u.user_id)}>Remover</AlertDialogAction>
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
