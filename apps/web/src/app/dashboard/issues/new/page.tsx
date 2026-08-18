"use client";

import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/input";
import { ImagePicker } from "@/components/image-picker";
import { api, toFormData } from "@/lib/api";
import { ISSUE_CATEGORIES, type AssetType } from "@bbe/types";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { toast } from "sonner";

function Inner() {
  const sp = useSearchParams();
  const router = useRouter();
  const assets = useQuery({ queryKey: ["my-assets"], queryFn: () => api("/api/assets?limit=100") });
  const [assetId, setAssetId] = useState(sp.get("assetId") || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [images, setImages] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const selected = (assets.data?.items || []).find((a: any) => a._id === assetId);
  const cats = useMemo(() => ISSUE_CATEGORIES[(selected?.type as AssetType) || "HARDWARE"], [selected]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Шинэ Issue</h1>
      <form
        className="card mt-4 space-y-3 p-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setSaving(true);
          try {
            const issue = await api("/api/issues", {
              method: "POST",
              body: JSON.stringify({ assetId, title, description, category, priority }),
            });
            if (images.length) {
              await api(`/api/issues/${issue._id}/attachments`, {
                method: "POST",
                body: toFormData({}, images),
              });
            }
            toast.success(`#${issue.issueNumber} үүслээ`);
            router.push(`/dashboard/issues/${issue._id}`);
          } catch (err: any) {
            toast.error(err.message || "Issue үүсгэхэд алдаа гарлаа");
          } finally {
            setSaving(false);
          }
        }}
      >
        <Field label="Asset">
          <Select value={assetId} onChange={(e) => setAssetId(e.target.value)} required>
            <option value="">Asset сонгоно уу</option>
            {(assets.data?.items || []).map((a: any) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </Select>
        </Field>
        <Field label="Гарчиг">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Системд нэвтрэх үед 500 error гарч байна" />
        </Field>
        <Field label="Ангилал">
          <Select value={category} onChange={(e) => setCategory(e.target.value)} required>
            <option value="">Сонгох</option>
            {cats.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="LOW">Бага</option>
            <option value="MEDIUM">Дунд</option>
            <option value="HIGH">Өндөр</option>
            <option value="CRITICAL">Ноцтой</option>
          </Select>
        </Field>
        <Field label="Тайлбар">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
        </Field>
        <ImagePicker files={images} onChange={setImages} label="Зураг" />
        <Button disabled={saving}>{saving ? "Хадгалж байна..." : "Үүсгэх"}</Button>
      </form>
    </div>
  );
}

export default function NewIssuePage() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
