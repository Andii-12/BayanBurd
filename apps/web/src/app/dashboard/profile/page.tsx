"use client";

import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user, client } = useAuth();
  return (
    <div>
      <h1 className="text-xl font-semibold">Профайл</h1>
      <div className="card mt-4 space-y-2 p-5 text-sm">
        <p>Нэр: {user?.firstName} {user?.lastName}</p>
        <p>Имэйл: {user?.email}</p>
        <p>Утас: {user?.phone}</p>
        <p>Компани: {client?.companyName}</p>
        <p>Регистр: {client?.registrationNumber}</p>
        <p>Хаяг: {client?.address || "—"}</p>
      </div>
    </div>
  );
}
