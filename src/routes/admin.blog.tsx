/**
 * /admin/blog — CRUD de posts do blog.
 *
 * Lista, criação, edição, publicação/despublicação e exclusão. Editor de
 * markdown com preview ao vivo (react-markdown). Capa via URL ou upload
 * base64. SEO por post (meta title / description / og image).
 *
 * Persistência via dataStore (tabela `blog_posts`). Só posts com status
 * "publicado" aparecem no site.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft, Eye, EyeOff, Pencil, Plus, Save, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  calcReadingTime, CATEGORIAS, deletePost, listAllPosts, savePost, slugify,
  type BlogCategoria, type BlogPost,
} from "@/lib/blog";

export const Route = createFileRoute("/admin/blog")({ component: AdminBlog });

const emptyPost = (): BlogPost => ({
  id: "", slug: "", titulo: "",
  categoria: "Vida nos EUA",
  capa: "", resumo: "", corpo: "",
  autor: "Equipe Status na América",
  status: "rascunho",
  data_publicacao: new Date().toISOString().slice(0, 10),
  meta_title: "", meta_description: "", og_image: "",
  tempo_leitura: 0,
});

function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editing, setEditing] = useState<BlogPost | null>(null);

  const reload = async () => setPosts(await listAllPosts());
  useEffect(() => { reload(); }, []);

  if (editing) {
    return <PostEditor post={editing} onClose={() => { setEditing(null); reload(); }} />;
  }

  return (
    <>
      <PageHeader
        title="Blog"
        description="Crie, edite e publique posts. Apenas posts com status 'publicado' aparecem no site."
        actions={
          <Button
            className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5"
            onClick={() => setEditing(emptyPost())}
          >
            <Plus className="h-4 w-4" /> Novo post
          </Button>
        }
      />

      <SectionCard>
        {posts.length === 0 ? (
          <p className="text-sm text-slate-500">Nenhum post ainda. Clique em “Novo post”.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-3">Título</th>
                  <th className="py-2 px-3">Categoria</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Data</th>
                  <th className="py-2 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-800">{p.titulo}</div>
                      <div className="text-xs text-slate-500 font-mono">/blog/{p.slug}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge variant="outline" className="text-[10px]">{p.categoria}</Badge>
                    </td>
                    <td className="py-2.5 px-3">
                      {p.status === "publicado" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-50 text-emerald-700 px-2 py-0.5 text-xs">
                          <Eye className="h-3 w-3" /> publicado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 text-slate-600 px-2 py-0.5 text-xs">
                          <EyeOff className="h-3 w-3" /> rascunho
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{p.data_publicacao}</td>
                    <td className="py-2.5 px-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(p)} className="gap-1">
                        <Pencil className="h-3.5 w-3.5" /> Editar
                      </Button>
                      <DeleteButton slug={p.slug} onDeleted={reload} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </>
  );
}

function DeleteButton({ slug, onDeleted }: { slug: string; onDeleted: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-red-600 gap-1">
          <Trash2 className="h-3.5 w-3.5" /> Excluir
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir post?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação é definitiva. O post <span className="font-mono">/blog/{slug}</span> será removido.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={async () => { await deletePost(slug); toast.success("Post excluído."); onDeleted(); }}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function PostEditor({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const [data, setData] = useState<BlogPost>(post);
  const isNew = !post.id;

  // Auto-slug quando o usuário ainda não tocou
  useEffect(() => {
    if (isNew && data.titulo && !data.slug) {
      setData((d) => ({ ...d, slug: slugify(d.titulo), id: slugify(d.titulo) }));
    }
  }, [data.titulo, data.slug, isNew]);

  const readingTime = useMemo(() => calcReadingTime(data.corpo || ""), [data.corpo]);

  async function handleSave(publish?: boolean) {
    if (!data.titulo.trim()) return toast.error("Informe um título.");
    if (!data.slug.trim()) return toast.error("Slug inválido.");
    const next: BlogPost = {
      ...data,
      slug: slugify(data.slug),
      id: slugify(data.slug),
      meta_title: data.meta_title || data.titulo,
      meta_description: data.meta_description || data.resumo,
      og_image: data.og_image || data.capa,
      status: publish === undefined ? data.status : (publish ? "publicado" : "rascunho"),
    };
    await savePost(next);
    toast.success(publish === true ? "Post publicado." : publish === false ? "Post despublicado." : "Post salvo.");
    setData(next);
  }

  // Upload de capa passou a ir para o CDN via <ImageUploader /> — o componente
  // devolve a URL pública direto no `onChange`. Base64 legado é detectado e
  // pede re-upload.

  return (
    <>
      <PageHeader
        title={isNew ? "Novo post" : "Editar post"}
        description="Edite o conteúdo, capa e SEO. O preview do markdown aparece ao lado."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Button>
            <Button variant="outline" onClick={() => handleSave(data.status === "publicado" ? false : true)} className="gap-1.5">
              {data.status === "publicado" ? <><EyeOff className="h-4 w-4" /> Despublicar</> : <><Eye className="h-4 w-4" /> Publicar</>}
            </Button>
            <Button onClick={() => handleSave()} className="bg-amber-400 text-slate-900 hover:bg-amber-500 gap-1.5">
              <Save className="h-4 w-4" /> Salvar
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 space-y-5">
          <SectionCard title="Conteúdo">
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={data.titulo} onChange={(e) => setData({ ...data, titulo: e.target.value })} />
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={data.slug}
                    onChange={(e) => setData({ ...data, slug: e.target.value })}
                    onBlur={() => setData((d) => ({ ...d, slug: slugify(d.slug) }))}
                  />
                  <div className="text-[11px] text-slate-500 mt-1 font-mono">/blog/{slugify(data.slug || data.titulo)}</div>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={data.categoria}
                    onValueChange={(v) => setData({ ...data, categoria: v as BlogCategoria })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Autor</Label>
                  <Input value={data.autor} onChange={(e) => setData({ ...data, autor: e.target.value })} />
                </div>
                <div>
                  <Label>Data de publicação</Label>
                  <Input
                    type="date"
                    value={data.data_publicacao}
                    onChange={(e) => setData({ ...data, data_publicacao: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Resumo (aparece nos cards e como meta description padrão)</Label>
                <Textarea rows={2} value={data.resumo} onChange={(e) => setData({ ...data, resumo: e.target.value })} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Capa">
            <ImageUploader
              value={data.capa}
              onChange={(url) => setData({ ...data, capa: url })}
              folder="blog"
              filenameHint={data.slug || "capa"}
            />
          </SectionCard>

          <SectionCard title="Corpo (Markdown)" description={`Tempo estimado de leitura: ${readingTime} min`}>
            <Textarea
              rows={18}
              value={data.corpo}
              onChange={(e) => setData({ ...data, corpo: e.target.value })}
              className="font-mono text-sm"
              placeholder="## Subtítulo&#10;&#10;Parágrafo…"
            />
          </SectionCard>

          <SectionCard title="SEO do post">
            <div className="space-y-3">
              <div>
                <Label>Meta title <span className="text-[11px] text-slate-400">({(data.meta_title || data.titulo).length}/60)</span></Label>
                <Input value={data.meta_title} placeholder={data.titulo} onChange={(e) => setData({ ...data, meta_title: e.target.value })} />
              </div>
              <div>
                <Label>Meta description <span className="text-[11px] text-slate-400">({(data.meta_description || data.resumo).length}/160)</span></Label>
                <Textarea rows={2} value={data.meta_description} placeholder={data.resumo}
                  onChange={(e) => setData({ ...data, meta_description: e.target.value })} />
              </div>
              <div>
                <Label>OG image</Label>
                <ImageUploader
                  value={data.og_image}
                  onChange={(url) => setData({ ...data, og_image: url })}
                  folder="blog"
                  filenameHint={`${data.slug || "post"}-og`}
                />
                <p className="text-[11px] text-slate-400 mt-1">Se vazio, usa a capa.</p>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Preview */}
        <div className="lg:col-span-5">
          <SectionCard title="Preview do conteúdo" description="Renderização do markdown.">
            <article className="prose prose-slate max-w-none prose-sm prose-headings:font-serif prose-h2:text-2xl prose-h3:text-xl">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {data.corpo || "_Sem conteúdo ainda._"}
              </ReactMarkdown>
            </article>
          </SectionCard>
        </div>
      </div>
    </>
  );
}
