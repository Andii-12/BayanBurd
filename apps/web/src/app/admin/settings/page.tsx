export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-xl font-semibold">Settings</h1>
      <div className="card mt-4 space-y-3 p-5 text-sm leading-relaxed">
        <p>
          Зураг хоёр R2 bucket дээр хадгалагдана: <code>issueimages</code> (issue) болон <code>productimages</code> (бүтээгдэхүүн).
        </p>
        <ol className="list-decimal space-y-1 pl-5 text-[#374151]">
          <li>Bucket бүрт Settings → Public Development URL идэвхжүүлэх</li>
          <li>R2 API Token (Object Read & Write) үүсгэх</li>
          <li>apps/api/.env дээр STORAGE_DRIVER=r2 болон public URL-уудыг тавих</li>
        </ol>
        <p className="text-[#6B7280]">
          STORAGE_ENDPOINT, STORAGE_BUCKET_ISSUES, STORAGE_BUCKET_PRODUCTS, STORAGE_ACCESS_KEY, STORAGE_SECRET_KEY,
          STORAGE_PUBLIC_URL_ISSUES, STORAGE_PUBLIC_URL_PRODUCTS
        </p>
        <p>
          Имэйл Resend-ээр илгээгдэнэ (бүртгэл, нууц үг сэргээх). <code>RESEND_API_KEY</code> болон <code>RESEND_FROM</code>-ийг apps/api/.env дээр тавина.
        </p>
        <p>QPay төлбөрийг дараа нэмэх abstraction бэлэн (BANK_TRANSFER / INVOICE / MANUAL).</p>
        <p>Upload max: UPLOAD_MAX_MB</p>
      </div>
    </div>
  );
}
