import { signInAction } from "@/lib/actions";

export default async function LoginPage(props: { searchParams: Promise<{ loi?: string }> }) {
  const searchParams = await props.searchParams;
  const msg =
    searchParams.loi === "sai"
      ? "Email hoặc mật khẩu chưa đúng."
      : searchParams.loi === "quyen"
      ? "Tài khoản này chưa được cấp quyền quản trị."
      : null;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="text-3xl">Đăng nhập quản trị</h1>
      <p className="mt-2 text-muted">Dành cho ban tổ chức của thiền tôn.</p>

      <form action={signInAction} className="mt-8 space-y-5">
        {msg && (
          <div role="alert" className="rounded-md border border-lotus/40 bg-lotus/10 px-4 py-3 text-lotus">
            {msg}
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">Email</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="field" />
        </div>
        <div>
          <label htmlFor="password" className="label">Mật khẩu</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="field" />
        </div>
        <button type="submit" className="btn btn-primary w-full">Đăng nhập</button>
      </form>
    </div>
  );
}
