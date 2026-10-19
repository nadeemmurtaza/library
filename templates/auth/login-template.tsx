export const LoginTemplate = () => (
  <div className="min-h-screen flex items-center justify-center bg-base-200">
    <div className="card w-full max-w-md bg-base-100 p-8 shadow-xl">
      <h2 className="text-2xl font-bold mb-4">Welcome back</h2>
      <input type="email" placeholder="Email" className="input input-bordered w-full mb-3" />
      <input type="password" placeholder="Password" className="input input-bordered w-full mb-4" />
      <button className="btn btn-primary w-full">Sign in</button>
    </div>
  </div>
)
