export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="card mt-4 space-y-2 p-5 text-sm">
        <p>Файл хадгалалт: Cloudflare R2 эсвэл local upload (STORAGE_DRIVER).</p>
        <p>Имэйл: SMTP_* орчны хувьсагчаар тохируулна.</p>
        <p>QPay төлбөрийг дараа нэмэх abstraction бэлэн (BANK_TRANSFER / INVOICE / MANUAL).</p>
        <p>Upload max: UPLOAD_MAX_MB</p>
      </div>
    </div>
  );
}
