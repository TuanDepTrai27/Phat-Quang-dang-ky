import { LookupForm } from "@/components/LookupForm";

export default async function LookupPage(props: { searchParams: Promise<{ ma?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-3xl">Tra cứu đăng ký</h1>
      <p className="mt-2 text-muted">
        Nhập mã đăng ký và số điện thoại để xem trạng thái hoặc hủy đăng ký.
      </p>
      <div className="mt-8">
        <LookupForm initialCode={(searchParams.ma ?? "").slice(0, 12)} />
      </div>
    </div>
  );
}
